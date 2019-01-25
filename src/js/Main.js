import LetsPlayClient from './LetsPlayClient.js'
import LetsPlaySocket from './LetsPlaySocket.js'

$('document').ready(function() {
    var client = new LetsPlayClient();
    var connection = new LetsPlaySocket('ws://' + prompt('Dev server uri', window.location.hostname + ':3074'), client);
    client.updateSocket(connection);

    // Expose most of the application for userscripts to extend and for debugging
    global.LetsPlay = {
        Client: client,
        Socket: connection
    };
});
