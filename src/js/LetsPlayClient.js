import Keyboard from './Keyboard.js'
import Display from './Display.js'
import KeybindModal from './KeybindModal.js'
import LetsPlayConfig from './LetsPlayConfig.js'
import GamepadManager from './GamepadManager.js'
import RetroJoypad from './RetroJoypad.js'

function LetsPlayClient() {
    var self = this;

    // Initialize display
    this.display = new Display();

    // Create a web worker for generating the blob urls for the screen
    this.screenWorker = new Worker('/screenWorker.js');

    // Create a web worker for generating the blub urls for the previews
    this.previewWorker = new Worker('/previewWorker.js');

    // Blob URLs returned by the worker will be displayed
    self.screenWorker.addEventListener('message', function(e) {
        self.display.update(e.data);
    }, false);

    // Display Blob URLs returned by the worker for the emu card previews
    self.previewWorker.addEventListener('message', function(e) {
        let cardIndex = e.data.id;
        let url = e.data.url;

        let image = new Image();
        image.src = url;

        // Update image
        $('.emu-preview>div')[cardIndex].appendChild(image);
    }, false);

    // Initialize the keybind modal
    this.keybindModal = new KeybindModal(self);

    this.config = new LetsPlayConfig();

    this.gamepadManager = new GamepadManager(self);

    // JS implicit object reference magic
    this.connection = {};
    var connection = this.connection;
    var socket;

    /**
     * List of who's online.
     * @type {string[]}
     */
    this.onlineUsers = [];

    /**
     * Turn queue list.
     * @type {string[]}
     */
    this.turnQueue = [];

    /**
     * Bool for whether or not the user has a turn (prevents accidental button sends or keyboard key captures). Whether or not the user *actually* has a turn and can control the emulator is determined by the server.
     * @type {boolean}
     */
    this.hasTurn = false;


    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
     }

    // Add a new message to the chat
    this.appendMessage = function(who, message, type="chat") {
        const hue = (hash(who) % (360 / 15)) * 15;
        switch(type) {
            case "chat":
                $(` <div class="chat-item">
                        <p class="username" style="color: hsla(` + hue + `, 100%, 50%, 1);">` + escapeHtml(who) + `</p>
                        <p class="separator">:</p>
                        <span class="chat-text">` + escapeHtml(message) + `</span>
                    </div>`)
                    .appendTo('#chat-list-items');
                break;
            case "announcement":
                $(` <div class="chat-item">
                        <span class="chat-announcement">` + escapeHtml(message) + `</span>
                    </div>`)
                .appendTo('#chat-list-items');
                break;
        }
        // Set scroll to bottom
        let chat_list = document.getElementById('chat-list-items');
        chat_list.scrollTop = chat_list.scrollHeight;
    };

    this.sendChatboxContent = function() {
        socket.send('chat',
                    $('#chat-input-box').val().trim());
        $('#chat-input-box').val('');
    };

    this.hideModal = function(DOMSelector) {
        let jElem = $(DOMSelector);
        jElem.css('opacity', '0');
        setTimeout(function() {
            jElem.removeClass('modal-active');
            jElem.css('opacity', '');
        }, 200);

        if(jElem[0] && jElem[0].id === 'keybind-modal') {
            self.keybindModal.stopListen();
            $('#keybindings-prompt').addClass('d-hidden');
            $('#keybindings-content').removeClass('d-hidden');
        }
    };

    this.showModal = function(DOMSelector) {
        let jElem = $(DOMSelector);
        jElem.css('opacity', '0');
        jElem.addClass('modal-active');
        // Firefox doesn't animate this right if there's no delay (chromium is the same way, but the setTimeout can be set to 1)
        setTimeout(function() {
            jElem.css('opacity', '100');
        }, 10);

        if(jElem[0].id === 'keybind-modal') {
            $('#keybindings-content').addClass('d-hidden');
            $('#keybindings-prompt').removeClass('d-hidden');
        }
    };

    this.updateSocket = function(newSocket) {
        self.connection = newSocket.socket;
        connection = newSocket.socket;
        socket = newSocket;
    };

    this.invalidUsername = function() {
        $('#username-modal-subtitle').css('color', '#e42e2e');
        $('.username-group').addClass('shake-horizontal');
        setTimeout(function() {
            $('#username-modal-subtitle').css('color', '');
        }, 500);
        setTimeout(function() {
            $('.username-group').removeClass('shake-horizontal');
        }, 900);
    };

    this.validUsername = function(newUsername) {
        localStorage.setItem('username', newUsername);
        self.hideModal('.modal-active');
    };

    this.setUsername = function(newUsername) {
        if(!socket.pendingValidation && socket.rawSocket.readyState === WebSocket.OPEN) {
            socket.pendingValidation = true;
            socket.send('username', newUsername);
        }
    };

    this.mute = function(time) {
        time = parseInt(time);
        if(!isNaN(time)) {
            self.appendMessage('', 'You have been muted for ' + time + ' seconds.', 'announcement');
            $('#chat-input-box').prop('disabled', true);
            setTimeout(function() {
                self.appendMessage('', 'You are no longer muted.', 'announcement');
                $('#chat-input-box').prop('disabled', false);
            }, 1000 * time);
        }
    }

    // djb2 by Dan Bernstein
    function hash(str) {
        var hash = 5381;

        for(var i in str) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
        }

        return hash;
    }

    this.updateOnlineUsers = function(list) {
        self.onlineUsers = list.sort();
        self.updateUserList();
    }

    this.updateTurnList = function(list) {
        if(list.length > 0) {
            // If there was a change in who has a turn
            if(list[0] !== self.turnQueue[0])
                self.appendMessage('', list[0] + ' now has a turn.', 'announcement');

            if(list[0] === localStorage.getItem('username')) {
                self.hasTurn = true;
                setTimeout(function() {$('#screen').css('cursor', 'none');}, 2000);
                $('#screen').addClass('turn');
            } else {
                self.hasTurn = false;
                $('#screen').css('cursor', 'auto');
                $('#screen').removeClass('turn');
            }
        } else {
            self.hasTurn = false;
            $('#screen').css('cursor', 'auto');
            $('#screen').removeClass('turn');
        }

        self.turnQueue = list;

        self.updateUserList();
    }

    this.updateUserList = function() {
        $('#user-list').empty();
        self.turnQueue.forEach(user => {
            const hue = (hash(user) % (360 / 15)) * 15;
            $(`<div class="user-list-item turn">
                    <p style="color: hsla(` + hue + `, 100%, 50%, 1);">` + escapeHtml(user) + `</p>
                </div>`).appendTo('#user-list');
        });

        self.onlineUsers.sort();
        self.onlineUsers.forEach(user => {
            const hue = (hash(user) % (360 / 15)) * 15;
            if(self.turnQueue.indexOf(user) === -1) {
                $(`<div class="user-list-item">
                        <p style="color: hsla(` + hue + `, 100%, 50%, 1);">` + escapeHtml(user) + `</p>
                    </div>`).appendTo('#user-list');
            }
        });

        self.updateUserCount();
    }

    this.updateUserCount = function() {
        let count = self.onlineUsers.length,
            s = '';
        if(count === 0)
            s += 'No Users';
        else if(count === 1)
            s += '1 User';
        else
            s += '' + count + ' Users';

        s += ' Online';

        $('#user-list-title').children().first().text(s);
    };

    this.updateEmuInfo = function() {
        $('#minUsernameLength').text(socket.currentEmu.minUsernameLength);
        $('#maxUsernameLength').text(socket.currentEmu.maxUsernameLength);

        document.getElementById('chat-input-box').maxLength = socket.currentEmu.maxMessageSize;

        $('#room-info').text(socket.currentEmu.name);
    };

    this.updateJoinView = function(emuInfo) {
        $('#join-view').empty();
        for(let i = 0; i < emuInfo.length; i+=2) {
            let id = emuInfo[i];
            let title = emuInfo[i + 1];
            $('#join-view')
                .append(`<div class="emu-card" id="emu-` + id + `">
                            <div class="emu-preview">
                                <div>
                                </div>
                            </div>
                            <div class="emu-title">
                                <p>` + title + `</p>
                            </div>
                        </div>`);

            $('#emu-' + id).click((e) => {
                socket.currentEmu.name = id;
                socket.send('connect', id);
            });
        }
    };

    this.addUser = function(who) {
        self.onlineUsers.push(who);
        self.onlineUsers.sort();
        self.updateOnlineUsers(self.onlineUsers);
    };

    this.removeUser = function(who) {
        self.updateOnlineUsers(self.onlineUsers.filter(word => word !== who));
    };

    this.renameUser = function(who, toWhat) {
        let i = self.onlineUsers.indexOf(who);
        if(i !== -1)
            self.onlineUsers[i] = toWhat;

        let j = self.turnQueue.indexOf(who);
        if(j !== -1)
            self.turnQueue[i] = toWhat;

        self.updateUserList();
    };

    this.displayBindings = function() {
        $('#keybindings-prompt').addClass('d-hidden');
        $('#keybindings-content').removeClass('d-hidden');

        var currentLayout = self.keybindModal.unsavedLayout;

        let buttonBinds = currentLayout.button;

        $('#keybinding-binds').empty();
        $('#keybinding-binds').append('<b>Binding</b>');

        let els = $('#keybinding-buttons').children();

        for(let i = 1; i < els.length;++i) {
            // Get name for retroID lookup
            let buttonName = els[i].innerText;

            // Get ID for searching current layout
            let retroID = RetroJoypad.indexOf(buttonName);

            // The text of the button; default to unmapped
            var buttonText = '(unmapped)';

            if(self.keybindModal.configuringDevice === 'keyboard') {
                let entries = Object.entries(currentLayout.button);
                entries.forEach(k => {
                    // check v null?
                    if(k[1] === retroID)
                        buttonText = k[0];
                });
            } else {
                // Search buttons first
                currentLayout.button.forEach((e, i) => {
                    if(e === null) return;

                    if(e === retroID)
                        buttonText = 'Button ' + i;
                });

                // Then analog
                if(buttonText === '(unmapped)') {
                    currentLayout.axes.forEach((p, i) => {
                        if(p === null) return;

                        if(p[0] === retroID)
                            buttonText = 'Axes ' + i + '-';
                        else if(p[1] === retroID)
                            buttonText = 'Axes ' + i + '+';
                    });
                }
            }

            $('#keybinding-binds').append('<div id="' + buttonName + '" class="press-a-key">' + buttonText + '</div>');
        }

        $('.press-a-key').click(e => {
            self.keybindModal.configuringButton = e.target.id;
        });
    };

    this.connectToEmu = function(which) {
        socket.send('connect', which);
    };

    // When outside box of modal is clicked, close it
    $(document).on("click", ".modal", e => {
        let target = $(e.target || e.srcElement);
        if (target.is(".modal")) {
            self.hideModal('.modal-active');
        }
    });

    $('.modal').keyup(e => {
        if(e.which === 27 /* Escape */) {
            self.hideModal(e.delegateTarget);
        }
    });

    $('#username-cancel').click(() => {
        self.hideModal('#username-modal');
    });

    $('#keybindings-cancel').click(() => {
        self.keybindModal.stopListen();
        self.hideModal('#keybind-modal');
    });

    $('#username-submit').click(() => {
        self.setUsername($('#username-input').val());
    });

    $('#keybindings-submit').click(() => {
        self.keybindModal.saveLayout();
        self.keybindModal.stopListen();
        self.hideModal('#keybind-modal');
    });

    $('#settings-username').click(() => {
        self.showModal('#username-modal');
        $('#username-input').val(localStorage.getItem('username') || '');
    });

    $('#settings-keybindings').click(e => {
        self.keybindModal.startListen();
        self.showModal('#keybind-modal');
    });

    // On enter (not shift-enter), send chatbox contents as a chat message
    document.getElementById('chat-input-box').onkeyup = function(e) {
        if((e.key == 'Enter') || (e.keyCode == 13) && !e.shiftKey) {
            e.preventDefault();
            self.sendChatboxContent();
        }
    }

    // On enter, set username
    document.getElementById('username-input').onkeyup = e => {
        if(e.key == 'Enter' || e.keyCode == 13) {
            e.preventDefault();
            self.setUsername($('#username-input').val() || '');
        }
    }

    // Send chatbox contents on send button click
    $('#send-btn').click(self.sendChatboxContent);

    $('#screen').click(e => {
        if(!self.hasTurn)
            socket.send('turn');
    });

    // Hide the settings dialogue if anything other than the navbar or settings dialogue is clicked
    document.getElementById('emu-view').onclick = function(e) {
        let target = e.srcElement || e.target;
        if((target.id != 'settings-btn') && (target.className != 'material-icons'))
            $('#settings-popup').css('display', 'none');
    };

    // Show the settings dialogue when the settings button is clicked
    $('#settings-btn').click(e => {
        $('#settings-popup').css('display', 'flex');
    });

    $('#ff-btn').click(e => {
        socket.send('ff');
    });

    this.appendMessage('', `Welcome to Let's Play! While best played with a USB controller, there are keyboard controls. The default button map is BAXY to KLIJ respectively, LR to QE. D-Pad buttons are WASD. Tab is select, and enter is start. Keyboard and gamepad buttons can be remapped to your liking through the settings near the bottom.`, 'announcement');

    // Theme stuff
    this.currentTheme = localStorage.getItem('theme') || 'default';
    $('#root').addClass(this.currentTheme);

    function setThemeText() {
        if(self.currentTheme === 'default')
            $('#settings-theme').text('Dark Theme');
        else
            $('#settings-theme').text('Light Theme');
    }

    setThemeText();

    $('#settings-theme').click(function() {
        $('#root').removeClass();

        if(self.currentTheme === 'default') {
            $('#root').addClass('dark');
            self.currentTheme = 'dark';
            localStorage.setItem('theme', 'dark');
        } else {
            $('#root').addClass('default');
            self.currentTheme = 'default';
            localStorage.setItem('theme', 'default');
        }

        setThemeText();
    });

}

export default LetsPlayClient;
