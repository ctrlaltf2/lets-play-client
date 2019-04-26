import LetsPlayClient from './LetsPlayClient.js'
import LetsPlaySocket from './LetsPlaySocket.js'

$('document').ready(function() {
    var client = new LetsPlayClient();
    var connection = new LetsPlaySocket('ws://' + window.location.host, client);
    client.updateSocket(connection);

    // Expose most of the application for userscripts to extend and for debugging
    global.LetsPlay = {
        Client: client,
        Socket: connection
    };
});
