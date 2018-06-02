var instances = {
    modals: [],
}

var wsConnected = false;
var socket;

$(document).ready(function(){
    $("#preloader").hide();

    // Entry setup
    $('#uri-field').keyup(function(e) {
        if(e.keyCode == 13) {
            $('#urifield').removeClass('valid');
            $('#urifield').removeClass('invalid');

            if($('#urifield').val().startsWith("ws://")) {
                $('#urifield').addClass('valid');
                $('#entry-loader').show();

                socket = new WebSocket($('#urifield').val());

                socket.onerror = function(error) {
                    $('#entry-loader').hide();
                    socket.close();
                    M.toast({html: `An error with the websocket occurred. Check the server's connection or your URL`});
                    $('#urifield').addClass('invalid');
                };

                socket.onopen = function(open) {
                    $('#entry-loader').hide();
                    $('#app-entry').hide();
                    $('#app-main').fadeIn(250);
                    $('nav').fadeIn(250);
                };

                socket.onmessage = onMessage;
            } else {
                $('#urifield').addClass('invalid');
                M.toast({html: 'Invalid URI scheme'});
            }
        }
    });


    $('#console-input').keyup(function(e) {
        if(e.keyCode == 13) {
            e.preventDefault();

            let data = $('#console-input').val();
            $('#console-input').val('');

            let console = document.getElementById('console');
            let sent = document.createElement('li');

            sent.textContent = data;
            sent.className = 'sent line';

            console.appendChild(sent);
            sent.scrollIntoView();

            socket.send(data);
        }
    });
});

function onMessage(message) {
    let console = document.getElementById('console');
    let received = document.createElement('li');

    received.className = 'received line';
    received.textContent = message.data;

    console.appendChild(received);
    received.scrollIntoView();
}
