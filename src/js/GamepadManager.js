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
     * Controller layouts
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
        self.updateLayout();
        console.log(self.controllerLayouts);
        if(self.controllerLayouts[evt.gamepad.id] === undefined) { // Fallback on known controllerStates
            // Unknown controller, tell the user that it will need mapped
            client.appendMessage('', 'Unknown controller plugged in. Please map it using the keybindings menu.', 'announcement');
        }
        self.pollInput(evt.gamepad.index);
    };

    /**
     * Callback registered for when a gamepad is disconnected.
    */
    this.onDisconnect = function(evt) {
        cancelAnimationFrame(self.pollInputIDs[evt.gamepad.id]);
    };

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
        let events = [];
        for(let i = 0; i < state.buttons.length;++i) {
            if(state.buttons[i] === undefined)
                state.buttons[i] = false;

            // If button state changed

            if(gamepad.buttons[i].pressed !== state.buttons[i]) {
                events.push({
                    player: index,
                    id:     gamepad.id,
                    button: {
                        type: 'button',
                        id: i,
                        value: {
                            // Shifts a 0 or 1 value over by 15. 32768 is the 'fully pressed' value for the server backend (and the defacto for most gamepad systems)
                            old: (state.buttons[1] << 15) - (state.buttons[1] ? 1 : 0),
                            new: (gamepad.buttons[i].pressed << 15) - (gamepad.buttons[i].pressed ? 1 : 0)
                        }
                    }
                });
            }
            state.buttons[i] = gamepad.buttons[i].pressed;
        }

        self.controllerStates[gamepad.id] = state;

        for(let i = 0; i < state.axes.length;++i) {
            if(state.axes[i] === undefined)
                state.axes[i] = 0;

            if(gamepad.axes[i] !== state.axes[i]) {
                events.push({
                    player: index,
                    id:     gamepad.id,
                    button: {
                        type: 'axes',
                        id: i,
                        value: {
                            old: Math.floor(state.axes[i] * ((1 << 15) - 1)),
                            new: Math.floor(gamepad.axes[i] * ((1 << 15) - 1))
                        }
                    }
                });
            }
            state.axes[i] = gamepad.axes[i];
        }

        events.forEach(event => {
            let ev = new CustomEvent('gamepadEvent', { detail: event });
            window.dispatchEvent(ev);
        });

        self.pollInputIDs[gamepad.id] = requestAnimationFrame(self.pollInput.bind(self.pollInput, index));
    };

    // Button order reflects order of buttons in internal layout objects and in the keybindings modal
    this.buttonOrder = 'B A X Y Up Down Left Right L R L2 R2 L3 R3 Start Select Turn'.split(' ');

    const blankLayout = {
        button: [
            // Index is the physical button number, value is the Retroarch button ID
        ],
        axes: [
            /* List of pairs
             * [3, 4], First item in pair is the Retroarch value if the axes is positive, and the second
             * [1, 0], item is the value if the axes is positive
             */
        ]
    };

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

    window.addEventListener('gamepadconnected', this.onConnect);
    window.addEventListener('gamepaddisconnected', this.onDisconnect);
}
export default GamepadManager;
