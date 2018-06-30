$('document').ready(function() {
    let screen = document.getElementById('screen');
    let ctx = screen.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.oImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.filter = 'saturate(130%)'; // A little bit of saturation won't hurt (experimental feature so some stuff might not see this but its not important)

    screen.height = 160;
    screen.width = 240;
    screen.height *= 3;
    screen.width *= 3;
    drawSMPTEBars(screen, ctx);

});

function drawSMPTEBars(canvas, ctx) {
    let width = canvas.width,
        height = canvas.height;


    let colors = [
        ['fff', 'ffe500', '00ffd7', '0fe000', 'ff00fe', 'e30013', '0000ff'],
        ['0000ff', '353535', 'ff00fe', '676767', '00ffd7', '353535', 'fff'],
        ['006261', 'fff', '00196b', '676767', '8d8d8d', '353535']
    ];

    let heights = [
        75,
        5,
        20
    ];

    let cX = 0, cY = 0;
    for(let row in colors) {
        let rowHeight = heights[row] / 100 * height;
        let cellWidth = width / colors[row].length;
        for(let i in colors[row]) {
            ctx.fillStyle = '#' + colors[row][i];
            ctx.fillRect(cX, cY, cellWidth, rowHeight);
            cX += cellWidth;
        }
        cY += rowHeight;
        cX = 0;
    }
    ctx.fillStyle = '#000';
    ctx.fillRect(0, (height - (height / 5) - (height * .05)) / 2, width, (height / 5) + (height * .05));

    ctx.font = Math.floor((height / 5 )) + 'px monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText('NO SIGNAL', width / 2, height / 2);
}

var connection = new WebSocket('ws://localhost:' + prompt("Asio sucks", "8080"));
connection.binaryType = "arraybuffer";
connection.onopen = function() {
    console.log('Connection opened');
    connection.send("8.username,4.Fork;");
    connection.send("7.connect,4.emu1;");
    $('#screen').click(function() {
        ws.send("4.turn;");
    });
};
connection.onmessage = function(event) {
    // Binary message type
    if(event.data instanceof ArrayBuffer) {
        let bytearray = new Uint8Array(event.data);
        var binstr = Array.prototype.map.call(bytearray, function (ch) {
            return String.fromCharCode(ch);
        }).join('');
        let b64encoded = btoa(binstr);

        var image = new Image();
        image.addEventListener('load', function() {
            var canvas = document.getElementById('screen');
            if (canvas.getContext) {
                var ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            }
        });
        image.src = 'data:image/jpeg;base64,' + b64encoded;

    } else { // Plaintext message type
        console.log('text message: ' + event.data);
    }
};

connection.onclose = function() {
    console.log('Connection closed.');
};

connection.onerror = function() {
    console.log('Connection error.');
}
