import RetroJoypad from './RetroJoypad.js'

/**
 * Threshold for the values of the analog sticks/buttons that determines whether its pressed or not.
 * @type {number}
 * @const
 */
const analogThreshold = 0.2;

function GamepadManager(client) {
    var self = this;

    /**
     * Controller states for the gamepads used this session.
     * @note gamepad id -> controller state
     */
    this.controllerStates = {};

    /**
     * Controller button -> RetroArch ID layouts for gamepads. Saved between sessions.
     * @note map, gamepad id -> gamepad layout
     * @note mirrors exactly the structure of controllerStates, just a different use
     */
    this.controllerLayouts = {};

    /**
     * Time stamp for the last time the browser polled controller input and updated the internal button state.
     */
    this.lastPolledTimestamp = [];

    /**
     * IDs used for requestAnimationFrame.
     * @note gamepad id -> int(poll input ID) relation
     */
    this.pollInputIDs = [];

    /**
     * Callback registered for when a gamepad is connected.
     */
    this.onConnect = function(evt) {
        if(evt.gamepad.mapping === 'standard') { // Try to use standard map, if supported by controller
            self.controllerStates[evt.gamepad.id] = self.controllerStates['standard'];
        } else if(self.controllerStates[evt.gamepad.id] === undefined) { // Fallback on known controllerStates
            // Unknown controller, tell the user that it will need mapped
            client.appendMessage('', 'Unknown controller plugged in. Please map it using the keybindings menu.', 'announcement');
        }
        self.pollInput(evt.gamepad.index);
    };

    window.addEventListener('gamepadconnected', this.onConnect);

    /**
     * Callback registered for when a gamepad is disconnected.
    */
    this.onDisconnect = function(evt) {
        cancelAnimationFrame(self.pollInputIDs[evt.gamepad.id]);
    };

    window.addEventListener('gamepaddisconnected', this.onDisconnect);

    /**
     * Main polling loop function that fires button press events
     */
    this.pollInput = function(index) {
        let gamepad = navigator.getGamepads()[index];

        // Controller unplugged but the loop started before the pollInput loop was cancelled.
        if(gamepad === undefined)
            return;

        if(self.lastPolledTimestamp[gamepad.id] !== gamepad.timestamp) {
            self.lastPolledTimestamp[gamepad.id] = gamepad.timestamp;
        } else {
            self.pollInputIDs[gamepad.id] = requestAnimationFrame(self.pollInput.bind(self.pollInput, index));
            return;
        }

        let state = self.controllerStates[gamepad.id];

        state = state || {};
        state.buttons = state.buttons || new Array(gamepad.buttons.length);
        state.axes = state.axes || new Array(gamepad.axes.length);

        // -----------
        for(let i = 0; i < state.buttons.length;++i) {
            if(state.buttons[i] === undefined)
                state.buttons[i] = false;

            // If button state changed

            if(gamepad.buttons[i].pressed !== state.buttons[i]) {
                if(gamepad.buttons[i].pressed) { // down
                    let ev = new CustomEvent('gamepadButtonPress',
                        {detail: {
                            player: index,
                            id:     gamepad.id,
                            button: i,
                            action: 'down'
                        }});
                    window.dispatchEvent(ev);
                } else { // up
                    let ev = new CustomEvent('gamepadButtonRelease',
                        {detail: {
                            player: index,
                            id:     gamepad.id,
                            button: i,
                            action: 'down'
                        }});
                    window.dispatchEvent(ev);
                }
            }
            state.buttons[i] = gamepad.buttons[i].pressed;
        }

        self.controllerStates[gamepad.id] = state;

        for(let i = 0; i < state.axes.length;++i) {
            if(state.axes[i] === undefined)
                state.axes[i] = 0;

            if(gamepad.axes[i] !== state.axes[i]) {
                let ev = new CustomEvent('gamepadAxesUpdate',
                    {detail: {
                        player: index,
                        id:     gamepad.id,
                        axes:   i,
                        value:  {
                            old: state.axes[i],
                            new: gamepad.axes[i]
                        }
                    }});
                window.dispatchEvent(ev);
            }
            state.axes[i] = gamepad.axes[i];
        }

        self.pollInputIDs[gamepad.id] = requestAnimationFrame(self.pollInput.bind(self.pollInput, index));
    };

    // Button order reflects order of buttons in internal layout objects and in the keybindings modal
    this.buttonOrder = 'B A X Y Up Down Left Right L R L2 R2 L3 R3 Start Select Turn'.split(' ');

    const blankLayout = function() {
        var layout = {};

        layout.buttons = new Array(self.buttonOrder.length).fill({});

        for(var i in self.buttonOrder)
            layout.buttons[i] = {
                name: self.buttonOrder[i],
                deviceValue: undefined
            }

        return layout;
    }();

    this.updateLayout = function() {
        this.controllerLayouts = client.config.layout;
    }

    this.getLayout = function(deviceID) {
        client.config.reload();
        if(client.config.layout[deviceID])
            return client.config.layout[deviceID];
        else
            return blankLayout;
    }

    this.setLayout = function(deviceID, layout) {
        client.config.layout[deviceID] = layout;
        client.config.save();
        self.updateLayout();
    }

}
export default GamepadManager;
