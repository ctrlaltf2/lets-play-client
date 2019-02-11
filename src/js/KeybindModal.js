import RetroJoypad from './RetroJoypad.js'

function KeybindModal(client) {
    var self = this;

    this.listening = false;

    this.configuringDevice = undefined;

    this.configuringButton = undefined;

    this.unsavedLayout;
    //              { Button event
    // Controller --
    //              { Axes event
    // Keyboard

    // On open, listen for events from controller or keyboard
    // called from modal open code in LetsPlayClient
    this.startListen = function() {
        client.config.reload();
        self.listening = true;
    }

    this.stopListen = function() {
        self.configuringDevice = self.configuringButton = self.unsavedLayout = undefined;
        self.listening = false;
    }

    this.saveLayout = function() {
        client.gamepadManager.setLayout(self.configuringDevice, self.unsavedLayout);
    }

    window.addEventListener('gamepadButtonPress', function(evt) {
        if(self.listening === false)
            return;

        if(self.configuringDevice === undefined) { // Waiting for a button press to select device
            self.configuringDevice = evt.detail.id;

            // Tell client to update the modal and pull layout for that device and display it
            client.displayBindings(evt.detail.id);

            // Update unsaved layout
            self.unsavedLayout = client.gamepadManager.getLayout(evt.detail.id);
            return;
        }

        if(evt.detail.id !== self.configuringDevice)
            return;

        if(self.configuringButton !== undefined) { // Waiting for a button press to configure key
            // Change text display
            $('#' + self.configuringButton).text('Button ' + evt.detail.button);
            // Update localStorage keybindings
            for(let i in self.unsavedLayout.buttons) {
                if(self.unsavedLayout.buttons[i].name === self.configuringButton) {
                    self.unsavedLayout.buttons[i].deviceValue = evt.detail.button;
                }
            }
            self.configuringButton = undefined;
        }
    });

    window.addEventListener('keydown', function(evt) {
        if(self.listening === false)
            return;

        if(self.configuringDevice === undefined) { // Waiting for a button press
            self.configuringDevice = 'keyboard';
            // Tell client to display keybindings
            client.displayBindings('keyboard');

            // Update unsaved layout
            self.unsavedLayout = client.gamepadManager.getLayout(evt.detail.id);
            return;
        }

        if(self.configuringDevice !== 'keyboard')
            return;

        if(self.configuringButton !== undefined) {
            $('#' + self.configuringButton).text(evt.key || evt.keyCode || evt.which);
            // Update localStorage keybindings
            for(let i in self.unsavedLayout.buttons) {
                if(self.unsavedLayout.buttons[i].name === self.configuringButton) {
                    self.unsavedLayout.buttons[i].deviceValue = evt.key || evt.keyCode || evt.which;
                }
            }
            self.configuringButton = undefined;
        }
    });
}

export default KeybindModal;
