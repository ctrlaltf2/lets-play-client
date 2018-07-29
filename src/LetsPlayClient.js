import Keyboard from './Keyboard.js'
import Display from './Display.js'

function LetsPlayClient() {
    var self = this;
    this.display = new Display();
    this.connection = {};
    var connection = this.connection;
    var socket;

    // List of strings for who's online
    this.onlineUsers = [];

    // Add a new message to the chat
    this.appendMessage = function(who, message) {
        let chat_list = document.getElementById('chat-list-items');
        let message_container = document.createElement('div');
        message_container.className = 'chat-item';
        message_container.innerHTML = `<p class="username">` + who + `</p><p class="separator">:</p><span class="chat-text">` + message + `</span>`
        chat_list.appendChild(message_container);
        chat_list.scrollTop = chat_list.scrollHeight;
    };

    this.sendChatboxContent = function() {
        let message = document.getElementById('chat-input-box').value.trim();
        socket.send('chat', message);
        document.getElementById('chat-input-box').value = "";
    };

    this.hideModal = function(modal) {
        modal.style.opacity = '0';
        setTimeout(function(elem) {
            elem.className = elem.className.replace('modal-active', '');
            elem.style.opacity = '';
        }, 200, modal);
    };

    this.showModal = function(modal) {
        if(modal) {
            modal.style.opacity = '0';
            modal.className += ' modal-active';
            // Firefox doesn't animate this right if there's no delay (chromium is the same way, but the setTimeout can be set to 1)
            setTimeout(function() {
                modal.style.opacity = '100';
            }, 10);
        }
    };

    this.updateSocket = function(newSocket) {
        self.connection = newSocket.socket;
        connection = newSocket.socket;
        socket = newSocket;
    };

    this.invalidUsername = function() {
        document.getElementById('username-modal-subtitle').style.color = '#e42e2e';
        document.getElementsByClassName('username-group')[0].className += ' shake-horizontal';
        setTimeout(function() { document.getElementById('username-modal-subtitle').style.color = ''; }, 500);
        setTimeout(function() { document.getElementsByClassName('username-group')[0].className = document.getElementsByClassName('username-group')[0].className.replace(' shake-horizontal', '');}, 900);
    };

    this.validUsername = function(newUsername) {
        localStorage.setItem('username', newUsername);
        self.hideModal(document.getElementsByClassName('modal-active')[0])
    };

    this.setUsername = function(newUsername) {
        if(!socket.pendingValidation && socket.rawSocket.readyState == WebSocket.OPEN) {
            socket.pendingValidation = true;
            socket.send('username', newUsername);
        }
    };

    this.updateUserList = function(list) {
        self.onlineUsers = list;
        self.onlineUsers.sort();
        let listElem = document.querySelector('#user-list');
        listElem.innerHTML = "";
        for(let i in list) {
            listElem.innerHTML += `<div class="user-list-item">
                                       <p>` + list[i] + `</p>
                                   </div>`;
        }
        self.updateUserCount();
    };
    self = this;

    this.updateUserCount = function() {
        let count = self.onlineUsers.length;
        let s = '';
        if(count === 0)
            s += 'No Users';
        else if(count === 1)
            s += '1 User';
        else
            s += '' + count + ' Users';

        s += ' Online';

        $('#user-list-title').children().first().text(s);
    }

    this.addUser = function(who) {
        self.onlineUsers.push(who);
        self.onlineUsers.sort();
        self.updateUserList(self.onlineUsers);
    }

    this.removeUser = function(who) {
        self.updateUserList(self.onlineUsers.filter(word => word !== who));
    }

    this.renameUser = function(who, toWhat) {
        let i = self.onlineUsers.indexOf(who);
        if(i !== -1)
            self.onlineUsers[i] = toWhat;
        self.updateUserList(self.onlineUsers);
    }

    // When outside box of modal is clicked, close it
    $(document).on("click", ".modal", function(e) {
        let target = $(e.target || e.srcElement);
        if (target.is(".modal")) {
            self.hideModal(target[0]);
        }
    });

    let modals = document.getElementsByClassName('modal') || [];
    for(let i = 0; i < modals.length;++i) {
        let modal = modals[i];
        modal.onkeyup = function(e) {
            if(e.key === 'Escape') {
                self.hideModal(modal);
            }
        }
    }

    document.getElementById('keybindings-cancel').onclick = function(e) {
        self.hideModal(document.getElementsByClassName('modal-active')[0])
    };

    document.getElementById('username-cancel').onclick = function(e) {
        self.hideModal(document.getElementsByClassName('modal-active')[0])
    };

    document.getElementById('username-submit').onclick = function(e) {
        self.setUsername(document.getElementById('username-input').value || '');
    }

    document.getElementById('settings-username').onclick = function(e) {
        self.showModal(document.getElementById('username-modal'));
        document.getElementById('username-input').value = localStorage.getItem('username') || '';
    };

    document.getElementById('settings-keybindings').onclick = function(e) {
        self.showModal(document.getElementById('keybind-modal'));
    };

    // On enter (not shift-enter), send chatbox contents as a chat message
    document.getElementById('chat-input-box').onkeyup = function(e) {
        if((e.key == 'Enter') || (e.keyCode == 13) && !e.shiftKey) {
            e.preventDefault();
            self.sendChatboxContent();
        }
    }

    // On enter, set username
    document.getElementById('username-input').onkeyup = function(e) {
        if(e.key == 'Enter' || e.keyCode == 13) {
            e.preventDefault();
            self.setUsername(document.getElementById('username-input').value || '');
        }
    }

    // Send chatbox contents on send button click
    document.getElementById('send-btn').onclick = self.sendChatboxContent;

    document.getElementById('screen').onkeydown = function(e) {
        if(Keyboard.keyAsRetroID[e.key] !== undefined && !e.repeat) {
            e.preventDefault();
            socket.send('button', 'down', Keyboard.keyAsRetroID[e.key] + '');
        }
    };

    document.getElementById('screen').onkeyup = function(e) {
        if(Keyboard.keyAsRetroID[e.key] !== undefined && !e.repeat) {
            e.preventDefault();
            socket.send('button', 'up', Keyboard.keyAsRetroID[e.key] + '');
        }
    };

    // Hide the settings dialogue if anything other than the navbar or settings dialogue is clicked
    document.getElementById('emu-view').onclick = function(e) {
        let target = e.srcElement || e.target;
        if((target.id != 'settings-btn') && (target.className != 'material-icons'))
            document.getElementById('settings-popup').style.display = 'none';
    };

    // Show the settings dialogue when the settings button is clicked
    document.getElementById('settings-btn').onclick = function(e) {
        document.getElementById('settings-popup').style.display = 'flex';
    };

    document.getElementById('user-list-close').onclick = function() {
        removeClass(document.getElementById('user-list-pane'), 'd-flex');
        document.getElementById('chat-pane').className += ' d-flex';

    };

    document.getElementById('list-btn').onclick = function() {
        removeClass(document.getElementById('chat-pane'), 'd-flex');
        document.getElementById('user-list-pane').className += ' d-flex';
    };
}

function removeClass(elem, what) {
    elem.className = elem.className.replace(what, ' ').trim().replace(/\s{2,}/, ' ');
}

export default LetsPlayClient;
