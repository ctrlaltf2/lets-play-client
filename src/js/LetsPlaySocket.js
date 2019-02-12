import LetsPlayProtocol from './LetsPlayProtocol.js'
import RetroJoypad from './RetroJoypad.js'

function LetsPlaySocket(wsURI, client) {
    var self = this;

    this.currentEmu = {
        name: 'emu1',
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
            console.log(command);

            if(command[1] == command[2]) // No username changed, it was invalid
                client.invalidUsername();
            else
                client.validUsername(command[2]);

            self.pendingValidation = false;
        }
    };

    this.onJoin = function(command) {
        console.log(command);
        client.addUser(command[1]);
        client.appendMessage('', command[1] + ' has joined.', 'announcement');
    }

    this.onLeave = function(command) {
        client.removeUser(command[1]);
        client.appendMessage('', command[1] + ' has left.', 'announcement');
    }

    this.onConnect = function(command) {
        if(command[1] === '1') {
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

    var rawSocket = new WebSocket(wsURI);
    this.rawSocket = rawSocket;
    rawSocket.binaryType = 'arraybuffer';

    rawSocket.onopen = function() {
        console.log('Connection opened');
        client.setUsername(localStorage.getItem('username'));
        self.send('connect', self.currentEmu.name);
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
            client.display.update(event.data);
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
                default:
                    console.log("Unimplemented command: " + command[0]);
            }
        }
    };

    // gamepadButtonRelease -- Button released
    // gamepadButtonPress -- Button pressed
    // gamepadAxesUpdate -- Axes changed
    window.addEventListener('gamepadButtonRelease', function(evt) {
        if(client.keybindModal.listening)
            return;

        let layout = client.gamepadManager.getLayout(evt.detail.id);
        console.log(layout, evt.detail.id);

        let buttonName;
        for(let i in layout.buttons) {
            if(layout.buttons[i].deviceValue === evt.detail.button) {
                buttonName = layout.buttons[i].name;
                break;
            }
        }

        let retroID = RetroJoypad[buttonName] + '';

        console.log('release', evt.detail.button);
        client.appendMessage('[GamepadAPI]', 'release ' + buttonName, 'announcement');
        self.send('button', 'up', retroID);
    });

    window.addEventListener('gamepadButtonPress', function(evt) {
        if(client.keybindModal.listening)
            return;

        let layout = client.gamepadManager.getLayout(evt.detail.id);

        let buttonName;
        for(let i in layout.buttons) {
            if(layout.buttons[i].deviceValue === evt.detail.button) {
                buttonName = layout.buttons[i].name;
                break;
            }
        }

        let retroID = RetroJoypad[buttonName] + '';

        console.log('press', evt.detail.button);
        client.appendMessage('[GamepadAPI]', 'press ' + buttonName, 'announcement');
        self.send('button', 'down', retroID);
    });

    window.addEventListener('gamepadAxesUpdate', function(evt) {
        client.appendMessage('[GamepadAPI]', 'analog ' + evt.detail.axes + ' ' + evt.detail.value.old + ' -> ' + evt.detail.value.new, 'announcement');
        // TODO: Send analog values
        // button, axes, buttonID, value (int16 value, +-32768?)
        // Check if cores translate analog button values correctly or if own algorithm has to be implememted (advanced settings checkbox thing?)
    });

    // Keyboard based game inputs
    function keyboardHandler(evt) {
        let action = this;

        if(client.keybindModal.listening)
            return;

        if(!client.hasTurn)
            return;

        if(evt.repeat)
            return;

        let layout = client.gamepadManager.getLayout('keyboard');

        let buttonName;
        let keyID = evt.key || evt.keyCode || evt.which;
        for(let i in layout.buttons) {
            if(layout.buttons[i].deviceValue === keyID) {
                buttonName = layout.buttons[i].name;
                break;
            }
        }

        let retroID = RetroJoypad[buttonName] + '';

        client.appendMessage('[GamepadAPI]', 'key ' + action + ' ' + buttonName, 'announcement');
        self.send('button', action, retroID);
    }

    document.getElementById('screen').onkeydown = keyboardHandler.bind('down');
    document.getElementById('screen').onkeyup = keyboardHandler.bind('up');
}

export default LetsPlaySocket;
