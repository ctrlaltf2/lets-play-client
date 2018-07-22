import GamepadManager from './GamepadManager.js'
import LetsPlayClient from './LetsPlayClient.js'
import LetsPlaySocket from './LetsPlaySocket.js'

$('document').ready(function() {
    var client = new LetsPlayClient();
    var connection = new LetsPlaySocket('ws://localhost' + prompt('Dev port', '3074'), client);
    client.updateSocket(connection.socket);
    var gm = new GamepadManager(connection.socket);

    // Expose most of the application for userscripts to extend and for debugging
    global.LetsPlay = {
        Client: client,
        Display: display,
        GamepadManager: gm
    };
});
