import RetroJoypad from './RetroJoypad.js'

// Make a shorthand for button assignment
let b = function(b) {
    return RetroJoypad.indexOf(b);
};

const KeyboardDefaults = {
    button: {
        'z': b('B'),
        'x': b('A'),
        's': b('X'),
        'a': b('Y'),
        'ArrowUp': b('Up'),
        'ArrowDown': b('Down'),
        'ArrowLeft': b('Left'),
        'ArrowRight': b('Right'),
        'Shift': b('Select'),
        'Enter': b('Start'),
        'q': b('L'),
        'w': b('R'),
    },
    axes: [
    ]
};

export default KeyboardDefaults;
