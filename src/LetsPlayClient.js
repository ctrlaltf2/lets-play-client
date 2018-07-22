import Keyboard from './Keyboard.js'
import Display from './Display.js'
import LetsPlayProtocol from './LetsPlayProtocol.js'

function LetsPlayClient() {
    var self = this;
    this.display = new Display();
    this.connection = {};
    var connection = this.connection;

    // Add a new message to the chat
    this.appendMessage = function(who, message) {
        console.log("Chat:", who, message);
        let chat_list = document.getElementById('chat-list-items');
        let message_container = document.createElement('div');
        message_container.className = 'chat-item';
        message_container.innerHTML = `<p class="username">` + who + `</p><p class="separator">:</p><span class="chat-text">` + message + `</span>`
        chat_list.appendChild(message_container);
        chat_list.scrollTop = chat_list.scrollHeight;
    };

    this.sendChatboxContent = function() {
        let message = document.getElementById('chat-input-box').value.trim();
        console.log("'" + message + "'");
        console.log(connection);
        if(connection.readyState === WebSocket.OPEN)
            connection.send(LetsPlayProtocol.encode(["chat", message]));        document.getElementById('chat-input-box').value = "";
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
        self.connection = newSocket;
        connection = newSocket;
    };

    // When outisde box of modal is clicked, close it
    $(document).on("click", ".modal", function(e) {
        var target = $(e.target || e.srcElement);
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

    document.getElementById('settings-username').onclick = function(e) {
        self.showModal(document.getElementById('username-modal'));
        //document.getElementById('username-input').value = getUsername();
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

    // Send chatbox contents on send button click
    document.getElementById('send-btn').onclick = self.sendChatboxContent;

    document.getElementById('screen').onkeydown = function(e) {
        if(Keyboard.keyAsRetroID[e.key] !== undefined && !e.repeat) {
            e.preventDefault();
            self.connection.send(LetsPlayProtocol.encode(["button", "down", Keyboard.keyAsRetroID[e.key] + '']));
        }
    };

    document.getElementById('screen').onkeyup = function(e) {
        console.log(Keyboard.keyAsRetroID[e.key]);
        console.log(e.key);
        if(Keyboard.keyAsRetroID[e.key] !== undefined && !e.repeat) {
            e.preventDefault();
            self.connection.send(LetsPlayProtocol.encode(["button", "up", Keyboard.keyAsRetroID[e.key] + '']));
        }
    };

    // Hide the settings dialogue if anything other than the navbar or settings dialogue is clicked
    document.getElementById('emu-view').onclick = function(e) {
        console.log(e);
        let target = e.srcElement || e.target;
        if((target.id != 'settings-btn') && (target.className != 'material-icons'))
            document.getElementById('settings-popup').style.display = 'none';
    };

    // Show the settings dialogue when the settings button is clicked
    document.getElementById('settings-btn').onclick = function(e) {
        document.getElementById('settings-popup').style.display = 'flex';
    };
}

export default LetsPlayClient;
