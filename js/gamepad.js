const joystickThreshold = 0.2;
const RetroJoypad = Object.freeze({
    'B': 0,
    'Y': 1,
    'Select': 2,
    'Start': 3,
    'Up': 4,
    'Down': 5,
    'Left': 6,
    'Right': 7,
    'A': 8,
    'X': 9,
    'L': 10,
    'R': 11,
    'L2': 12,
    'R2': 13,
    'L3': 14,
    'R3': 15
});

var gamepadMaps = {
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
        axes: [ // Update once analog implemented in backend
            new Axes(RetroJoypad['Left'], RetroJoypad['Right']),
            new Axes(RetroJoypad['Up'], RetroJoypad['Down']),
            new Axes(RetroJoypad['Left'], RetroJoypad['Right']),
            new Axes(RetroJoypad['Up'], RetroJoypad['Down'])
        ]
    },
    'Performance Designed Products Afterglow Gamepad for Xbox 360 (Vendor: 0e6f Product: 0213)': {
        buttons: [
            RetroJoypad['B'],
            RetroJoypad['A'],
            RetroJoypad['Y'],
            RetroJoypad['X'],
            RetroJoypad['L'],
            RetroJoypad['R'],
            RetroJoypad['Select'],
            RetroJoypad['Start'],
            undefined, // TODO: Use this button (home button) for taking a turn)
            RetroJoypad['L3'],
            RetroJoypad['R3']
        ],
        axes: [
            new Axes(RetroJoypad['Left'], RetroJoypad['Right']),
            new Axes(RetroJoypad['Up'], RetroJoypad['Down']),
            new Axes(undefined, RetroJoypad['L2']),
            new Axes(RetroJoypad['Left'], RetroJoypad['Right']),
            new Axes(RetroJoypad['Up'], RetroJoypad['Down']),
            new Axes(undefined, RetroJoypad['R2']),
            new Axes(RetroJoypad['Left'], RetroJoypad['Right']),
            new Axes(RetroJoypad['Up'], RetroJoypad['Down']),
        ]
    },
    '(null) usb gamepad            (Vendor: 0810 Product: e501)': { // Some sketchy usb snes controller (pretty sure its https://www.amazon.com/Nintendo-Controller-iNNEXT-Classic-Raspberry/dp/B01MZZXLGH/)
        buttons: [
            RetroJoypad['X'],
            RetroJoypad['A'],
            RetroJoypad['B'],
            RetroJoypad['Y'],
            RetroJoypad['L'],
            undefined,
            RetroJoypad['R'],
            undefined,
            RetroJoypad['Select'],
            RetroJoypad['Start']
        ],
        axes: [
            new Axes(RetroJoypad['Left'], RetroJoypad['Right']),
            new Axes(RetroJoypad['Up'], RetroJoypad['Down'])
        ]
    }
}

function Axes(negativeValue, positiveValue) {
    return {
        IDifNegative: negativeValue,
        IDifPositive: positiveValue,
        getRetroID: function(value) {
            if(value < -1 || value > 1) {
                return undefined;
            }

            if(Math.abs(value) < joystickThreshold) {
                return undefined;
            }

            if(value < 0)
                return this.IDifNegative;
            else
                return this.IDifPositive;
        }
    };
}
