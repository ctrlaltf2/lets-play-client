import LetsPlayProtocol from './LetsPlayProtocol.js'

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
        client.updateUserList(command.slice(1));
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
        self.currentEmu.turnLength = command[4];

        client.updateEmuInfo();
    }

    this.onPing = function(command) {
        self.send('pong');
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
                default:
                    console.log("Unimplemented command: " + command[0]);
            }
        }
    };
}

export default LetsPlaySocket;
