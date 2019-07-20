import LetsPlayProtocol from './LetsPlayProtocol.js'
import RetroJoypad from './RetroJoypad.js'

var /* enum */ BinaryMessage = {
    SCREEN: 0,
    PREVIEW: 1,
};

function LetsPlaySocket(wsURI, client) {
    var self = this;

    this.currentEmu = {
        name: undefined,
        maxMessageSize: undefined,
        minUsernameLength: undefined,
        maxUsernameLength: undefined,
        turnLength: undefined // ms
    };

    var username = localStorage.getItem('username') || '';
    this.pendingValidation = false;

    this.send = function() {
        if(rawSocket.readyState === WebSocket.OPEN) {
            let message = LetsPlayProtocol.encode(arguments);
            console.log('>> ' + message);
            rawSocket.send(message);
        }
    };

    /**
     * Function called when the server emits a chat command. Updates the chat list in the html to the new content after unescaping unicode and hex sequences in the message.
     */
    this.onChat = function(command) {
        let message = command[2].replace(/(\\x[\da-f]{2}|\\u[\da-f]{4}|\\u{1[\da-f]{4}})+/g, function a(x) {
                return eval("'" + x + "'")
        });
        client.appendMessage(command[1], message);
    };

    /**
     * Function called when the server emits a list command.
     */
    this.onList = function(command) {
        client.updateOnlineUsers(command.slice(1));
    };

    /**
     * Function called when the server emits a username command
     */
    this.onUsername = function(command) {
        if(self.pendingValidation) {
            if(command[1] == command[2]) // No username changed, it was invalid
                client.invalidUsername();
            else
                client.validUsername(command[2]);

            self.pendingValidation = false;
        }
    };

    this.onJoin = function(command) {
        client.addUser(command[1]);
        client.appendMessage('', command[1] + ' has joined.', 'announcement');
    }

    this.onLeave = function(command) {
        client.removeUser(command[1]);
        client.appendMessage('', command[1] + ' has left.', 'announcement');
    }

    this.onConnect = function(command) {
        if(command[1] === '1') {
            $('#join-view').addClass('d-hidden');
            $('#emu-view').removeClass('d-hidden');
            self.send('list');
        }
    }

    this.onRename = function(command) {
        client.renameUser(command[1], command[2]);
        client.appendMessage('', command[1] + ' is now known as ' + command[2] + '.', 'announcement');
    }

    this.onEmuInfo = function(command) {
        self.currentEmu.minUsernameLength = command[1];
        self.currentEmu.maxUsernameLength = command[2];
        self.currentEmu.maxMessageSize = command[3];
        // self.currentEmu.turnLength = command[4];
        self.currentEmu.name = command[4];

        client.updateEmuInfo();
    }

    this.onPing = function(command) {
        self.send('pong');
    }

    this.onTurns = function(command) {
        client.updateTurnList(command.slice(1));
    }

    this.onEmus = function(command) {
        client.updateJoinView(command.slice(1));
    }

    this.onMute = function(command) {
        client.mute(command.slice(1));
    }

    var rawSocket = new WebSocket(wsURI);
    this.rawSocket = rawSocket;
    rawSocket.binaryType = 'arraybuffer';

    rawSocket.onopen = function() {
        console.log('Connection opened');
        client.setUsername(localStorage.getItem('username'));
        let path = window.location.pathname;
        if(path.startsWith("/emu/")) {
            client.connectToEmu(path.split('/')[2]);
        }
    };

    rawSocket.onclose = function() {
        // TODO: Set client to error state (buttons disabled and stuff) and init reconnect process
        console.log('Connection closed.');
    };

    rawSocket.onerror = function() {
        console.log('Connection error.');
    };

    rawSocket.onmessage = function(event) {
        // Binary message type
        if(event.data instanceof ArrayBuffer) {
            let firstByte = new DataView(event.data, 0, 1).getInt8();

            // Unpack payload info byte
            let messageType = (firstByte & 0b11100000) >> 5;
            let messageInfo = firstByte & 0b00011111;

            if(messageType == BinaryMessage.SCREEN) // messageInfo: unused
                client.screenWorker.postMessage(event.data);
            else if(messageType == BinaryMessage.PREVIEW) // messageInfo: emu index
                client.previewWorker.postMessage({data: event.data, info: messageInfo});
        } else { // Plaintext message type
            console.log('<< ' + event.data);
            let command = LetsPlayProtocol.decode(event.data);
            if(command.length == 0)
                return;

            switch(command[0]) {
                case "chat":
                    self.onChat(command);
                    break;
                case "list":
                    self.onList(command);
                    break;
                case "username":
                    self.onUsername(command);
                    break;
                case "join":
                    self.onJoin(command);
                    break;
                case "leave":
                    self.onLeave(command);
                    break;
                case "connect":
                    self.onConnect(command);
                    break;
                case "rename":
                    self.onRename(command);
                    break;
                case "emuinfo":
                    self.onEmuInfo(command);
                    break;
                case "ping":
                    self.onPing(command);
                    break;
                case "turns":
                    self.onTurns(command);
                    break;
                case "emus":
                    self.onEmus(command);
                    break;
                case "mute":
                    self.onMute(command);
                    break;
                default:
                    console.log("Unimplemented command: " + command[0]);
            }
        }
    };

    function isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    window.addEventListener('gamepadEvent', function(evt) {
        if(client.keybindModal.listening)
            return;

        let layout = client.gamepadManager.getLayout(evt.detail.id);

        var retroID;

        if(evt.detail.button.type === 'button') {
            retroID = layout.button[evt.detail.button.id];
            if(retroID === null || retroID === undefined)
                return;
            self.send('button', 'button', retroID + '', evt.detail.button.value.new + '');
        } else if(evt.detail.button.type === 'axes') {
            let p = layout.axes[evt.detail.button.id];
            if(p === null) return;

            // Here, would check if p is assigned to a RetroJoypad joystick (what to do if one value is a button and one is the joystick????)

            // Confusing time! There are three possible state changes for the axes events and we must act accordingly for each

            let oldVal = evt.detail.button.value.old,
                newVal = evt.detail.button.value.new;

            if(Math.sign(oldVal) === Math.sign(newVal)) {
                // Don't care about analog changes in the button world unless a sign change happens
                return;
            }

            // Map a value's sign to its index in the axes assignment pair
            let valToIndex = i => Math.sign(i) === 1 ? 1 : 0;

            // Don't question it, it just works
            if(oldVal != 0) { // Unpress!
                let retroID = p[valToIndex(oldVal)];
                if(!(retroID === null || retroID === undefined))
                    self.send('button', 'button', retroID + '', '0');
            }

            if(newVal != 0) { // Press!
                let retroID = p[valToIndex(newVal)];
                if(!(retroID === null || retroID === undefined))
                    self.send('button', 'button', retroID + '', '32767');
            }
        }
    });

    // Keyboard based game inputs
    function keyboardHandler(evt) {
        let value = this;

        if(client.keybindModal.listening)
            return;

        if(!client.hasTurn)
            return;

        if(evt.repeat)
            return;

        let layout = client.gamepadManager.getLayout('keyboard');

        let retroID = layout.button[evt.key];
        if(retroID === undefined)
            return;

        self.send('button', 'button', retroID + '', value);
    }

    document.getElementById('screen').onkeydown = keyboardHandler.bind(((2 << 14) - 1) + '');
    document.getElementById('screen').onkeyup = keyboardHandler.bind(0 + '');
}

export default LetsPlaySocket;
