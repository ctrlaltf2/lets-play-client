import RetroJoypad from './RetroJoypad.js'

/**
 * Threshold for the values of the analog sticks/buttons that determines whether its pressed or not.
 * @type {number}
 */
var analogThreshold = 0.2;

function GamepadManager(socket) {
    var self = this;
    /**
     * Maps for various common gamepads
     */
     this.maps = {
        'standard': { // Values defined in https://www.w3.org/TR/gamepad/#remapping
            buttons: [
                RetroJoypad['B'],
                RetroJoypad['A'],
                RetroJoypad['Y'],
                RetroJoypad['X'],
                RetroJoypad['L'],
                RetroJoypad['R'],
                RetroJoypad['L2'],
                RetroJoypad['R2'],
                RetroJoypad['Select'],
                RetroJoypad['Start'],
                RetroJoypad['L3'],
                RetroJoypad['R3'],
                RetroJoypad['Up'],
                RetroJoypad['Down'],
                RetroJoypad['Left'],
                RetroJoypad['Right'],
            ],
            axes: [ // TODO: Update once analog implemented in backend
                new Axes(RetroJoypad['Left'], RetroJoypad['Right']),
                new Axes(RetroJoypad['Up'], RetroJoypad['Down']),
                new Axes(RetroJoypad['Left'], RetroJoypad['Right']),
                new Axes(RetroJoypad['Up'], RetroJoypad['Down'])
            ]
        }
     };

    /**
     * Currently loaded button layout, defaults to standard html5 layout. Modified by the keybindings modal.
     */
    this.currentLayout = {};

    /**
     * Whether or not there is a controller connected being managed by this GamepadManager.
     * @type {boolean}
     */
    this.isConnected = false;

    /**
     * Time stamp for the last time the browser polled controller input and updated the internal button state.
     * @type {number}
     */
    this.lastPolledTimestamp = 0;

    /**
     * ID used for requestAnimationFrame.
     */
    this.pollInputID = undefined;

    /**
     * Array for keeping track of a button's state where the index of the array is the index of the button in the gamepad object, and the value being if it is pressed or not.
     * @type {boolean[]}
     */
    this.buttonState = [];

    /**
     * Same function as {@link this.buttonState} except for analog buttons.
     * @type {boolean[]}
     */
    this.axesState = [];

    /**
     * Callback registered for when a gamepad is connected.
     */
    this.onConnect = function(evt) {
        if(evt.gamepad.index === 0) {
            // Try to use standard mapping if the controller has it
            if(evt.gamepad.mapping === 'standard') {
                self.currentLayout = self.maps['standard'];
                self.isConnected = true;
                self.pollInput();
            } else { // Try to lookup button map in known maps
                if(self.maps[evt.gamepad.id]) {
                    self.currentLayout = maps[evt.gamepad.id];
                    self.isConnected = true;
                    self.pollInput();
                } else {
                    alert("Unknown controller plugged in");
                }
            }
        }
    };

    window.addEventListener("gamepadconnected", this.onConnect);

    /**
     * Callback registered for when a gamepad is disconnected.
    */
    this.onDisconnect = function(evt) {
        if(evt.gamepad.index === 0) {
            self.isConnected = false;
            self.buttonState = [];
            cancelAnimationFrame(self.pollInputID);
        }
    };

    window.addEventListener("gamepaddisconnected", this.onDisconnect);

    /**
     * Main polling loop function that updates internal gamepad state and sends button updates to the socket
     */
    this.pollInput = function() {
        if(self.isConnected === true) {
            let controller = navigator.getGamepads()[0];
            if(self.lastPolledTimestamp !== controller.timestamp) {
                self.lastPolledTimestamp = controller.timestamp;
            } else {
                self.pollInputID = requestAnimationFrame(self.pollInput);
                return;
            }

            let layout = self.currentLayout;
            if(layout) {
                for(let i = 0; i < layout.buttons.length;++i) {
                    if(self.buttonState[i] === undefined) {
                        self.buttonState[i] = false;
                    }

                    if(controller.buttons[i].pressed !== self.buttonState[i]) {
                        if(controller.buttons[i].pressed) { // down
                            socket.send('button', 'down', layout.buttons[i] + '');
                        } else { // up
                            socket.send('button', 'up', layout.buttons[i] + '');
                        }
                    }

                    self.buttonState[i] = controller.buttons[i].pressed;
                }

                // Until the backend supports analog, convert any analog axes values to digital
                for(let i = 0; i < layout.axes.length;++i) {
                    let value;
                    // Round to -1 or 1 respecting the threshold
                    if(Math.abs(controller.axes[i]) > self.analogThreshold) {
                        if(controller.axes[i] < 0)
                            value = -1;
                        else
                            value = 1;
                    } else {
                        value = 0;
                    }

                    // If first time this function has run through, default state
                    if(self.axesState[i] === undefined) {
                        self.axesState[i] = 0;
                    }

                    let previousValue = self.axesState[i];
                    if(previousValue != value) {
                        if(previousValue === 0) { // Rest -> something
                            socket.send('button', 'down', layout.axes[i].getRetroID(value) + '');
                        } else if (value === 0) { // Something -> Rest
                            socket.send('button', 'up', layout.axes[i].getRetroID(value) + '');
                        } else { // Something -> something
                            socket.send('button', 'up', layout.axes[i].getRetroID(value) + '');
                            socket.send('button', 'down', layout.axes[i].getRetroID(value) + '');
                        }
                    }

                    self.axesState[i] = value;
                }
            } else {
                console.log("layout not setup");
            }
        }
        self.pollInputID = requestAnimationFrame(self.pollInput);
    }
};


function Axes(negativeValue, positiveValue) {
    /**
     * RetroPad ID that the axes should be equal to if the analog value is negative and outside of the threshold
     * @type {number}
     */
    this.IDifNegative = negativeValue;

    /**
     * RetroPad ID that the axes should be equal to if the analog value is positive and outside of the threshold
     * @type {number}
     */
    this.IDifPositive = positiveValue;

    /**
     * Get the RetroPad ID for the Axes based on the analog value in the range [-1, 1]
     */
    this.getRetroID = function(value) {
        if(value < -1 || value > 1) {
            return undefined;
        }

        if(Math.abs(value) < analogThreshold) {
            return undefined;
        }

        if(value < 0)
            return self.IDifNegative;
        else
            return self.IDifPositive;
    };
};

export default GamepadManager;
