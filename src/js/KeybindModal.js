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
        client.gamepadManager.setLayout(self.configuringDevice, self.unsavedLayout);
        self.configuringDevice = self.configuringButton = self.unsavedLayout = undefined;
        self.listening = false;
    }

    window.addEventListener('gamepadButtonPress', function(evt) {
        if(self.listening === false)
            return;

        if(self.configuringDevice === undefined) { // Waiting for a button press to select device
            self.configuringDevice = evt.detail.id;
            // Tell client to display keybindings
            client.displayBindings(evt.detail.id);
            self.unsavedLayout = client.gamepadManager.getLayout(evt.detail.id);
            // Client will pull from config the button layout for the device being configured
            ;
            // Client will populate the button text with the button id/key name
            ;
            // Finally, exit this event thing
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
            // Client will pull from localStorage the button layout for the device being configured
            // Client will populate the button text with the button id/key name
            // Finally, exit this event thing
            return;
        }

        if(self.configuringButton !== undefined) {

        }

        if(evt.detail.id !== self.configuringDevice)
            return;

    });

    // Pull config for that device from localStorage

    // Set internal value that says we are configuring a specific device

    // On press-a-key press, update internal value that says which key we are changing

    // controller layouts are as such:
    /* 'gamepad ID' {
     *      buttons: {
     *          RetroJoypad['Value']: Device ID
     *      },
     *      axes: {
     *          // To be implemented
     *      }
     * }
     */

    // Once a key is pressed on the device we are configuring, update its config value and save to localStorage. Notify gm that there was an update and that it should pull it.
}

export default KeybindModal;
