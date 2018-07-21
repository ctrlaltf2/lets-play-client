var gamepad = {
    joystickThreshold: 0.2,
    retroJoypad: Object.freeze({
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
    }),
    maps: {
        'standard': { // Values defined in https://www.w3.org/TR/gamepad/#remapping
        buttons: [
            retroJoypad['B'],
            retroJoypad['A'],
            retroJoypad['Y'],
            retroJoypad['X'],
            retroJoypad['L'],
            retroJoypad['R'],
            retroJoypad['L2'],
            retroJoypad['R2'],
            retroJoypad['Select'],
            retroJoypad['Start'],
            retroJoypad['L3'],
            retroJoypad['R3'],
            retroJoypad['Up'],
            retroJoypad['Down'],
            retroJoypad['Left'],
            retroJoypad['Right'],
        ],
        axes: [ // Update once analog implemented in backend
            new Axes(retroJoypad['Left'], retroJoypad['Right']),
            new Axes(retroJoypad['Up'], retroJoypad['Down']),
            new Axes(retroJoypad['Left'], retroJoypad['Right']),
            new Axes(retroJoypad['Up'], retroJoypad['Down'])
        ]
    },
    'Performance Designed Products Afterglow Gamepad for Xbox 360 (Vendor: 0e6f Product: 0213)': {
        buttons: [
            retroJoypad['B'],
            retroJoypad['A'],
            retroJoypad['Y'],
            retroJoypad['X'],
            retroJoypad['L'],
            retroJoypad['R'],
            retroJoypad['Select'],
            retroJoypad['Start'],
            undefined, // TODO: Use this button (home button) for taking a turn)
            retroJoypad['L3'],
            retroJoypad['R3']
        ],
        axes: [
            new Axes(retroJoypad['Left'], retroJoypad['Right']),
            new Axes(retroJoypad['Up'], retroJoypad['Down']),
            new Axes(undefined, retroJoypad['L2']),
            new Axes(retroJoypad['Left'], retroJoypad['Right']),
            new Axes(retroJoypad['Up'], retroJoypad['Down']),
            new Axes(undefined, retroJoypad['R2']),
            new Axes(retroJoypad['Left'], retroJoypad['Right']),
            new Axes(retroJoypad['Up'], retroJoypad['Down']),
        ]
    },
        '(null) usb gamepad            (Vendor: 0810 Product: e501)': { // Some sketchy usb snes controller (pretty sure its https://www.amazon.com/Nintendo-Controller-iNNEXT-Classic-Raspberry/dp/B01MZZXLGH/)
        buttons: [
            retroJoypad['X'],
            retroJoypad['A'],
            retroJoypad['B'],
            retroJoypad['Y'],
            retroJoypad['L'],
            undefined,
            retroJoypad['R'],
            undefined,
            retroJoypad['Select'],
            retroJoypad['Start']
        ],
        axes: [
            new Axes(retroJoypad['Left'], retroJoypad['Right']),
            new Axes(retroJoypad['Up'], retroJoypad['Down'])
        ]
    }
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

            if(Math.abs(value) < gamepad.joystickThreshold) {
                return undefined;
            }

            if(value < 0)
                return this.IDifNegative;
            else
                return this.IDifPositive;
        }
    };
}

export default gamepad;
