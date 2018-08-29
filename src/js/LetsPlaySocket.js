import LetsPlayProtocol from './LetsPlayProtocol.js'

function LetsPlaySocket(wsURI, client) {
    var self = this;

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
        if(self.pendingValidation && (command[1] == '0' || command[1] == '1')) {
            self.pendingValidation = false;
            if(command[1] === '0') {
                client.invalidUsername();
            } else if(command[1] === '1') {
                client.validUsername(command[2]);
            } else if(command[2] === '') { // Tried to duplicate username
                console.log('duplicate');
                client.validUsername(guestUsername());
            }
        } else { // A rename
            client.renameUser(command[1], command[2]);
        }
    };

    this.onJoin = function(command) {
        client.addUser(command[1]);
    }

    this.onLeave = function(command) {
        client.removeUser(command[1]);
    }

    var guestUsername = function() {
        let username = '';
        do {
            username = 'guest' + Math.floor(Math.random() * 9999);
        } while(!client.usernameAvailable(username));
        return username;
    }

    var rawSocket = new WebSocket(wsURI);
    this.rawSocket = rawSocket;
    rawSocket.binaryType = 'arraybuffer';

    rawSocket.onopen = function() {
        console.log('Connection opened');
        self.send('username', localStorage.getItem('username') || guestUsername());
        self.send('connect', 'emu1');
        self.send('list');
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
                default:
                    console.log("Unimplemented command: " + command[0]);
            }
        }
    };
}

export default LetsPlaySocket;