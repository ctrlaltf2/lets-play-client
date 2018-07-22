import LetsPlayProtocol from './LetsPlayProtocol.js'

function LetsPlaySocket(wsURI, client) {
    var self = this;
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
        client.appendMessage("[Server]", "Users online: " + (command.length - 1));
    };

    var socket = new WebSocket(wsURI);
    this.socket = socket;
    socket.binaryType = 'arraybuffer';

    socket.onopen = function() {
        console.log('Connection opened');
        let username = 'guest' + Math.floor(Math.random(0, 9999) * 9999);
        let message = LetsPlayProtocol.encode(["username", username]);
        socket.send(message);
        socket.send("7.connect,4.emu1;");
    };

    socket.onclose = function() {
        // TODO: Set client to error state (buttons disabled and stuff) and init reconnect process
        console.log('Connection closed.');
    };

    socket.onerror = function() {
        console.log('Connection error.');
    };

    socket.onmessage = function(event) {
        // Binary message type
        if(event.data instanceof ArrayBuffer) {
            client.display.update(event.data);
        } else { // Plaintext message type
            console.log('text message: ' + event.data);
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
                default:
                    console.log("Unimplemented command: " + command[0]);
            }
        }
    };
}

export default LetsPlaySocket;
