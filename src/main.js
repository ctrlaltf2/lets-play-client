var trueWidth = -1,
    trueHeight = -1;

// Object for storing callbacks (exposed to allow for userscripts to extend functionality)
var app = {
    username: "",
    pendingUsername: "",
    waitingUsernameValid: false,
    input: {
        gamepad: {
            connected: false,
            layout: {},
            onconnect: function(evt) {
                if(evt.gamepad.index === 0) {
                    // Try to use standard mapping if the controller has it
                    if(evt.gamepad.mapping == 'standard') {
                        app.input.gamepad.layout = gamepadMaps['standard'];
                        app.input.gamepad.connected = true;
                        app.input.gamepad.pollInput();
                    } else { // Try to lookup button map in known maps
                        if(gamepadMaps[evt.gamepad.id]) {
                            app.input.gamepad.layout = gamepadMaps[evt.gamepad.id];
                            app.input.gamepad.connected = true;
                            app.input.gamepad.pollInput();
                        } else {
                            alert("Unknown controller plugged in");
                        }
                    }
                }
            },
            ondisconnect: function(evt) {
                if(evt.gamepad.index === 0) {
                    app.input.gamepad.connected = false;
                    app.input.gamepad.buttonstate = [];
                    cancelAnimationFrame(app.input.gamepad.pollInputID);
                }
            },
            buttonstate: [],
            axesstate: [],
            pollInputID: undefined,
            pollInput: function() {
                if(app.input.gamepad.connected === true) {
                    let gamepad = navigator.getGamepads()[0];
                    if(app.input.gamepad.lastPolledTimestamp != gamepad.timestamp) {
                        app.input.gamepad.lastPolledTimestamp = gamepad.timestamp;
                    } else {
                        app.input.gamepad.pollInputID = requestAnimationFrame(app.input.gamepad.pollInput);
                        return;
                    }

                    let layout = app.input.gamepad.layout;
                    if(layout) {
                        for(let i = 0; i < layout.buttons.length;++i) {
                            if(app.input.gamepad.buttonstate[i] == undefined) {
                                app.input.gamepad.buttonstate[i] = false;
                            }

                            if(gamepad.buttons[i].pressed != app.input.gamepad.buttonstate[i]) {
                                if(gamepad.buttons[i].pressed) { // down
                                    if(connection.readyState == connection.OPEN)
                                        connection.send(encodeCommand(["button", "down", layout.buttons[i] + '']));
                                } else { // up
                                    if(connection.readyState == connection.OPEN)
                                        connection.send(encodeCommand(["button", "up", layout.buttons[i] + '']));
                                }
                            }

                            app.input.gamepad.buttonstate[i] = gamepad.buttons[i].pressed;
                        }

                        // Until the backend supports analog, convert any analog axes values to digital
                        for(let i = 0; i < layout.axes.length;++i) {
                            let value;
                            // Round to -1 or 1 respecting the threshold
                            if(Math.abs(gamepad.axes[i]) > joystickThreshold) {
                                if(gamepad.axes[i] < 0)
                                    value = -1;
                                else
                                    value = 1;
                            } else {
                                value = 0;
                            }

                            // If first time this function has run through, default state
                            if(app.input.gamepad.axesstate[i] == undefined) {
                                app.input.gamepad.axesstate[i] = 0;
                            }

                            let previousValue = app.input.gamepad.axesstate[i];
                            if(previousValue != value) {
                                if(previousValue == 0) { // Rest -> something
                                    if(connection.readyState == connection.OPEN)
                                        connection.send(encodeCommand(["button", "down", layout.axes[i].getRetroID(value) + '']));
                                } else if (value == 0) { // Something -> Rest
                                    if(connection.readyState == connection.OPEN)
                                        connection.send(encodeCommand(["button", "up", layout.axes[i].getRetroID(previousValue) + '']));
                                } else { // Something -> something
                                    if(connection.readyState == connection.OPEN) {
                                        connection.send(encodeCommand(["button", "up", layout.axes[i].getRetroID(previousValue) + '']));
                                        connection.send(encodeCommand(["button", "down", layout.axes[i].getRetroID(value) + '']));
                                    }
                                }
                            }

                            app.input.gamepad.axesstate[i] = value;
                        }
                    } else {
                        console.log("layout not setup");
                    }
                }
                app.input.gamepad.pollInputID = requestAnimationFrame(app.input.gamepad.pollInput);
            },
            lastPolledTimestamp: 0
        },
        keyToRetroID: {
            'x':            RetroJoypad['B'],
            'c':            RetroJoypad['A'],
            's':            RetroJoypad['X'],
            'a':            RetroJoypad['Y'],
            'ArrowUp':      RetroJoypad['Up'],
            'ArrowDown':    RetroJoypad['Down'],
            'ArrowLeft':    RetroJoypad['Left'],
            'ArrowRight':   RetroJoypad['Right'],
            'Tab':          RetroJoypad['Select'],
            'Enter':        RetroJoypad['Start'],
            'q':            RetroJoypad['L'],
            'e':            RetroJoypad['R']
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

    connection = new WebSocket('ws://localhost:' + prompt("Enter port", "3074"));
    connection.binaryType = "arraybuffer";
    connection.onopen = function() {
        console.log('Connection opened');
        let username = 'guest' + Math.floor(Math.random(0, 9999) * 9999);
        let message = encodeCommand(["username", username]);
        connection.send(message);
        connection.send("7.connect,4.emu1;");
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
    };

    sendMessage = function() {
        let message = document.getElementById('chat-input-box').value.trim();
        console.log("'" + message + "'");
        connection.send("4.chat," + message.length + '.' + message + ';');
        document.getElementById('chat-input-box').value = "";
    };

    document.getElementById('chat-input-box').onkeyup = function(e) {
        if(e.keyCode == 13 && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    document.getElementById('send-btn').onclick = sendMessage;

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

    window.addEventListener("gamepadconnected", app.input.gamepad.onconnect);
    window.addEventListener("gamepaddisconnected", app.input.gamepad.ondisconnect);

    function hideModal(modal) {
        modal.style.opacity = '0';
        setTimeout(function(elem) {
            elem.className = elem.className.replace('modal-active', '');
            elem.style.opacity = '';
        }, 200, modal);
    }

    function showModal(modal) {
        if(modal) {
            modal.style.opacity = '0';
            modal.className += ' modal-active';
            // Firefox doesn't animate this right if there's no delay (chromium is the same way, but the setTimeout can be set to 1)
            setTimeout(function() {
                modal.style.opacity = '100';
            }, 10);
        }
    }

    $(document).on("click", ".modal", function(e) {
        var target = $(e.target || e.srcElement);
        if (target.is(".modal")) {
            hideModal(target[0]);
        }
    });

    let modals = document.getElementsByClassName('modal') || [];
    for(let i = 0; i < modals.length;++i) {
        let modal = modals[i];
        modal.onkeyup = function(e) {
            if(e.key === 'Escape') {
                hideModal(modal);
            }
        }
    }

    document.getElementById('keybindings-cancel').onclick = function(e) {
        hideModal(document.getElementsByClassName('modal-active')[0])
    };

    document.getElementById('username-cancel').onclick = function(e) {
        hideModal(document.getElementsByClassName('modal-active')[0])
    };

    document.getElementById('settings-username').onclick = function(e) {
        showModal(document.getElementById('username-modal'));
        document.getElementById('username-input').value = getUsername();
    };

    document.getElementById('settings-keybindings').onclick = function(e) {
        showModal(document.getElementById('keybind-modal'));
    };

    document.getElementById('emu-view').onclick = function(e) {
        console.log(e);
        let target = e.srcElement || e.target;
        if((target.id != 'settings-btn') && (target.className != 'material-icons'))
            document.getElementById('settings-popup').style.display = 'none';
    };

    document.getElementById('settings-btn').onclick = function(e) {
        document.getElementById('settings-popup').style.display = 'flex';
    };
});

function setUsername(name, setCookie) {
    if(setCookie === true) {
        document.cookie = "username=" + name;
        app.username = name;
        app.waitingUsernameValid = false;
    } else {
        if(connection.readyState == connection.OPEN) {
            app.pendingUsername = name;
            app.waitingUsernameValid = true;
            connection.send(encodeCommand(["username", name]));
        }
    }
}

function getUsername() {
    if (document.cookie.split(';').filter(function(item) {return item.indexOf('username=') >= 0}).length) {
        return document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    } else {
        return undefined;
    }
}

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

