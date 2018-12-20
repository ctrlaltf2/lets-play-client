import Keyboard from './Keyboard.js'
import Display from './Display.js'

function LetsPlayClient() {
    var self = this;

    // Initialize the display
    this.display = new Display();

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

    // Add a new message to the chat
    this.appendMessage = function(who, message, type="chat") {
        switch(type) {
            case "chat":
                $(` <div class="chat-item">
                        <p class="username">` + who + `</p>
                        <p class="separator">:</p>
                        <span class="chat-text">` + message + `</span>
                    </div>`)
                    .appendTo('#chat-list-items');
                break;
            case "announcement":
                $(` <div class="chat-item">
                        <span class="chat-announcement">` + message + `</span>
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
    };

    this.showModal = function(DOMSelector) {
        let jElem = $(DOMSelector);
        jElem.css('opacity', '0');
        jElem.addClass('modal-active');
        // Firefox doesn't animate this right if there's no delay (chromium is the same way, but the setTimeout can be set to 1)
        setTimeout(function() {
            jElem.css('opacity', '100');
        }, 10);
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
        console.log('setUsername');
        if(!socket.pendingValidation && socket.rawSocket.readyState === WebSocket.OPEN) {
            socket.pendingValidation = true;
            socket.send('username', newUsername);
        }
    };

    this.updateOnlineUsers = function(list) {
        self.onlineUsers = list.sort();
        self.updateUserList();
    }

    this.updateTurnList = function(list) {
        self.turnQueue = list;
        self.appendMessage(self.turnQueue[0] + ' now has a turn.', 'announcement');

        if(self.turnQueue[0] === localStorage.getItem('username'))
            self.hasTurn = true;
        else
            self.hasTurn = false;

        self.updateUserList();
    }

    this.updateUserList = function() {
        $('#user-list').empty();
        self.turnQueue.forEach(user => {
            $(`<div class="user-list-item turn">
                    <p>` + user + `</p>
                </div>`).appendTo('#user-list');
        });

        self.onlineUsers.sort();
        self.onlineUsers.forEach(user => {
            if(self.turnQueue.indexOf(user) === -1) {
                $(`<div class="user-list-item">
                        <p>` + user + `</p>
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

        self.updateUserlist();
    };

    // When outside box of modal is clicked, close it
    $(document).on("click", ".modal", e => {
        let target = $(e.target || e.srcElement);
        if (target.is(".modal")) {
            self.hideModal('.modal');
        }
    });

    $('.modal').keyup(e => {
        if(e.which === 27 /* Escape */) {
            self.hideModal(e.delegateTarget);
        }
    });

    $('#keybindings-cancel,#username-cancel').click(() => {
        self.hideModal('.modal-active');
    });

    $('#username-submit').click(() => {
        self.setUsername($('#username-input').val());
    });

    $('#settings-username').click(() => {
        self.showModal('#username-modal');
        $('#username-input').val(localStorage.getItem('username') || '');
    });

    $('#settings-keybindings').click(e => {
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

    document.getElementById('screen').onkeydown = e => {
        if(!self.hasTurn) return;
        if(Keyboard.keyAsRetroID[e.key] !== undefined && !e.repeat) {
            e.preventDefault();
            socket.send('button', 'down', Keyboard.keyAsRetroID[e.key] + '');
        }
    };

    document.getElementById('screen').onkeyup = e => {
        if(!self.hasTurn) return;
        if(Keyboard.keyAsRetroID[e.key] !== undefined && !e.repeat) {
            e.preventDefault();
            socket.send('button', 'up', Keyboard.keyAsRetroID[e.key] + '');
        }
    };

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

    $('#user-list-close').click(e => {
        $('#user-list-pane').removeClass('d-flex');
        $('#chat-pane').addClass('d-flex');
    });

    $('#list-btn').click(e => {
        $('#chat-pane').removeClass('d-flex');
        $('#user-list-pane').addClass('d-flex');
    });
}

export default LetsPlayClient;
