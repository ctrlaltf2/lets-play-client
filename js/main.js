var trueWidth = -1,
    trueHeight = -1;


// Object for storing callbacks (exposed to allow for userscripts to extend functionality)
var app = {
    input: {
        keyToRetroID: {
            'x': 0, // x -> RETRO_DEVICE_ID_JOYPAD_B
            'c': 8, // c -> RETRO_DEVICE_ID_JOYPAD_A
            's': 9, // s -> RETRO_DEVICE_ID_JOYPAD_X
            'a': 1, // a -> RETRO_DEVICE_ID_JOYPAD_Y
            'ArrowUp': 4, // arrow up -> RETRO_DEVICE_ID_JOYPAD_UP
            'ArrowDown': 5, // arrow down -> RETRO_DEVICE_ID_JOYPAD_DOWN
            'ArrowLeft': 6, // arrow left -> RETRO_DEVICE_ID_JOYPAD_LEFT
            'ArrowRight': 7, // arrow right -> RETRO_DEVICE_ID_JOYPAD_RIGHT
            'Tab':  2, // tab -> RETRO_DEVICE_ID_JOYPAD_SELECT
            'Space': 3, // space -> RETRO_DEVICE_ID_JOYPAD_START
            'q': 10, // q -> RETRO_DEVICE_ID_JOYPAD_L
            'e': 11 // e -> RETRO_DEVICE_ID_JOYPAD_R
        }
    },
    chat: {
        log: function(who, message) {
            let chat_list = document.getElementById('chat-list-items');
            let message_container = document.createElement('div');
            message_container.className = 'chat-item';
            message_container.innerHTML = `<p class="username">` + who + `</p><p class="separator">:</p><span class="chat-text">` + message + `</span>`
            chat_list.appendChild(message_container);
            chat_list.scrollTop = chat_list.scrollHeight;
        }
    },
    onchat: function(command) {
        let message = command[2].replace(/(\\x[\da-f]{2}|\\u[\da-f]{4}|\\u{1[\da-f]{4}})+/g, function a(x) {
                return eval("'" + x + "'")
        });
        app.chat.log(command[1], command[2]);
    },
    onscreen: function(imgdata) {
        let bytearray = new Uint8Array(imgdata);
        var binstr = Array.prototype.map.call(bytearray, function (ch) {
            return String.fromCharCode(ch);
        }).join('');
        let b64encoded = btoa(binstr);

        var image = new Image();
        image.addEventListener('load', function() {
            var canvas = document.getElementById('screen');
            if (canvas.getContext) {
                if(trueWidth != image.width || trueHeight != image.height) {
                    trueWidth = image.width;
                    trueHeight = image.height;

                    let aspectRatio = image.width / image.height;
                    // Better ways to do this, but Google doesn't know how to implement a standard...
                    let oneRem = parseFloat(getComputedStyle(document.documentElement).fontSize);
                    let maxCanvasHeight = parseFloat(window.getComputedStyle(document.getElementsByClassName('display-container')[0]).height) - (2 * oneRem);

                    let newWidth = aspectRatio * maxCanvasHeight;
                    let newHeight = maxCanvasHeight;

                    canvas.width = newWidth;
                    canvas.height = newHeight;

                    document.getElementById('screen').style.height = newHeight + 'px !important';
                    document.getElementById('screen').style.width = newWidth + 'px !important';
                }
                var ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            }
        });
        image.src = 'data:image/jpeg;base64,' + b64encoded;
    },
    onlist: function(command) {
        app.chat.log("[Server]", "Users online: " + (command.length - 1));
    }
};

var connection;

function decodeCommand(string) {
	var pos = -1
	var sections = []
    for (let i =0;i < 25;++i) {
		var len = string.indexOf('.', pos + 1)
        if (len == -1) {
			break
		}
		pos = parseInt(string.slice(pos + 1, len)) + len + 1
		sections.push(string.slice(len + 1, pos)
			.replace(/&#x27;/g, "'")
			.replace(/&quot;/g, '"')
			.replace(/&#x2F;/g, '/')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&amp;/g, '&')
		)
		if (string.slice(pos, pos + 1) == ';') {
			break
		}
	}
	return sections
}

function encodeCommand(cypher) {
	var command = "";
	for (var i = 0; i < cypher.length; i++) {
		var current = cypher[i];
		command += current.length + "." + current;
		command += (i < cypher.length - 1 ? "," : ";");
	}
	return command;
}

$('document').ready(function() {
    let screen = document.getElementById('screen');
    let ctx = screen.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.oImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.filter = 'saturate(130%)'; // A little bit of saturation won't hurt (experimental feature so some stuff might not see this but its not important)

    connection = new WebSocket('ws://localhost:' + prompt("Enter port", "8080"));
    connection.binaryType = "arraybuffer";
    connection.onopen = function() {
        console.log('Connection opened');
        let username = 'guest' + Math.floor(Math.random(0, 9999) * 9999);
        let message = encodeCommand(["username", username]);
        connection.send(message);
        connection.send("7.connect,4.emu1;");;
    };

    connection.onmessage = function(event) {
        // Binary message type
        if(event.data instanceof ArrayBuffer) {
            app.onscreen(event.data);
        } else { // Plaintext message type
            console.log('text message: ' + event.data);
            let command = decodeCommand(event.data);
            if(command.length == 0)
                return;

            switch(command[0]) {
                case "chat":
                    app.onchat(command);
                    break;
                case "list":
                    app.onlist(command);
                    break;
                default:
                    console.log("Unimplemented command: " + command[0]);
            }

        }
    };

    connection.onclose = function() {
        console.log('Connection closed.');
    };

    connection.onerror = function() {
        console.log('Connection error.');
    }

    document.getElementById('chat-input-box').onkeyup = function(e) {
        if(e.keyCode == 13 && !e.shiftKey) {
            e.preventDefault();
            let message = document.getElementById('chat-input-box').value.slice(0, -1);
            connection.send("4.chat," + message.length + '.' + message + ';');
            document.getElementById('chat-input-box').value = "";
        }
    }

    document.getElementById('screen').onkeydown = function(e) {
        if(!(app.input.keyToRetroID[e.key] === undefined) && !e.repeat) {
            e.preventDefault();
            connection.send(encodeCommand(["button", "down", app.input.keyToRetroID[e.key] + '']));
        }
    }

    document.getElementById('screen').onkeyup = function(e) {
        if(!(app.input.keyToRetroID[e.key] === undefined) && !e.repeat) {
            e.preventDefault();
            connection.send(encodeCommand(["button", "up", app.input.keyToRetroID[e.key] + '']));
        }
    }
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

