import RetroJoypad from './RetroJoypad.js'

function KeybindModal(client) {
    var self = this;

    this.listening = false;

    this.configuringDevice = undefined;

    this.configuringButton = undefined;

    this.unsavedLayout;

    /*
     * Pool that stores gamepad events so that they can be batch-processed.
     * Batch processing allows us to detect physical controller anomalies and figure out whether
     * the user actualy meant to press a button/change an axes, and act accordingly.
     */
    this.gamepadEventPool = [];

    // On open, listen for events from controller or keyboard
    // called from modal open code in LetsPlayClient
    this.startListen = function() {
        client.config.reload();
        self.listening = true;
    }

    this.stopListen = function() {
        self.configuringDevice = self.configuringButton = self.unsavedLayout = undefined;
        self.listening = false;
        self.gamepadEventPool = [];
    }

    this.saveLayout = function() {
        console.log('save');
        client.gamepadManager.setLayout(self.configuringDevice, self.unsavedLayout);
    }

    function selectKeybinding(event) {
        /*
        if(gamepad.axes[i] !== state.axes[i]) {
            events.push({
                player: index,
                id:     gamepad.id,
                button: {
                    type: 'axes',
                    id: i,
                    value: {
                        old: state.axes[i],
                        new: gamepad.axes[i]
                    }
                }
            });*/
        let id = event.button.id,
            type = event.button.type,
            value = event.button.value,
            retroID = RetroJoypad.indexOf(self.configuringButton);

        console.log(self.configuringButton);
        console.log('selected event: ', event);
        // Remove other instances of this retroID being assigned
        self.unsavedLayout.button = self.unsavedLayout.button.map((e, i) => {
            if(e === null || e === retroID) {
                console.log("button conflict for", e, ' at index', i);
                return null;
            }

            return e;
        });

        // Then analog
        self.unsavedLayout.axes = self.unsavedLayout.axes.map((p,i) => {
            if(p === null) {
                console.log('axes conflict for', p, ' at index', i);
                return [];
            }

            return [p[0] === retroID ? null : p[0], p[1] === retroID ? null : p[1]];
        });


        /*
        // Change text display
        var buttonText = type + ' ' + id;

        if(type === 'axes')
            buttonText += value.new > 0 ? '+' : '-';

        buttonText = buttonText.charAt(0).toUpperCase() + buttonText.slice(1);

        $('#' + self.configuringButton).text(buttonText);

        // Update localStorage keybindings
        let buttonName = type === 'button' ?
            id + '' :
            id + (value.new > 0 ? '+' : '-');*/

        if(type === 'button')
            self.unsavedLayout[type][id] = retroID;
        else if(type === 'axes') {
            if(self.unsavedLayout[type][id] == undefined)
                self.unsavedLayout[type][id] = [];
            if(value.new > 0)
                self.unsavedLayout[type][id][1] = retroID;
            else
                self.unsavedLayout[type][id][0] = retroID;
        }

        client.displayBindings();

        self.configuringButton = undefined;
    }

    function updateKeybinds() {
        console.log('gamepadPool: ', self.gamepadEventPool)
        var events = self.gamepadEventPool.filter(e => { // Filter button release
            return e.button.type === 'axes' || Math.abs(e.button.value.new) === 32767;
        }).filter(e => { // Filter floatey joysticks
            return e.button.type === 'button'  || Math.abs(e.button.value.new) > 0.25 * 32767;
        });
        console.log('events: ', events);

        self.gamepadEventPool = [];

        // We might have cleared out all of the events because of the above filters
        if(events.length === 0)
            return;

        let buttonPresses = 0, axesPresses = 0;
        events.forEach(event => {
            if(event.button.type === 'button')
                ++buttonPresses;
            else if(event.button.type === 'axes')
                ++axesPresses;
        });

        // Special case: pressing a single button on the controller shows up on the computer as an axes AND button update
        if(buttonPresses >= 1 && axesPresses >= 1) {
            selectKeybinding(events.find(e => e.button.type === 'button')); // Select first button
            return;
        }

        // Otherwise select the first event that got there
        selectKeybinding(events[0]);
    }

    window.addEventListener('gamepadEvent', function(evt) {
        if(self.listening === false)
            return;

        if(self.configuringDevice === undefined) { // Waiting for a button press to select device
            self.configuringDevice = evt.detail.id;

            // Update unsaved layout
            self.unsavedLayout = client.gamepadManager.getLayout(evt.detail.id);

            // Tell client to update the modal and pull layout for that device and display it
            client.displayBindings();

            return;
        }

        if(evt.detail.id !== self.configuringDevice)
            return;

        if(self.configuringButton !== undefined) { // Waiting for a button press to configure key
            // Push event
            self.gamepadEventPool.push(evt.detail);

            /*
             * If that event was brand new, schedule a flush. Successive calls to this function
             * would realistically be only able to be called because of a floaty joystick or a
             * controller which sends an axes AND button change for one physical press.
             */
            if(self.gamepadEventPool.length === 1)
                setTimeout(updateKeybinds, 100);

        }
    });

    window.addEventListener('keydown', function(evt) {
        if(self.listening === false)
            return;

        if(self.configuringDevice === undefined) { // Waiting for a button press
            self.configuringDevice = 'keyboard';

            // Update unsaved layout
            self.unsavedLayout = client.gamepadManager.getLayout('keyboard');

            // Tell client to display keybindings
            client.displayBindings();

            return;
        }

        if(self.configuringDevice !== 'keyboard')
            return;

        if(self.configuringButton !== undefined) {
            let key = evt.key;
            //$('#' + self.configuringButton).text(key);
            // Remove other instances for this key
            Object.keys(self.unsavedLayout.button).forEach(k => {
                if(k === key)
                    delete self.unsavedLayout.button[k];
            });

            self.unsavedLayout.button[key] = RetroJoypad.indexOf(self.configuringButton);
            self.configuringButton = undefined;

            client.displayBindings();
        }

    });
}

export default KeybindModal;
