import RetroJoypad from './RetroJoypad.js'

var Keyboard = {
    keyAsRetroID: {
        'x':            RetroJoypad['B'],
        'c':            RetroJoypad['A'],
        's':            RetroJoypad['X'],
        'a':            RetroJoypad['Y'],
        'ArrowUp':      RetroJoypad['Up'],
        'ArrowDown':    RetroJoypad['Down'],
        'ArrowLeft':    RetroJoypad['Left'],
        'ArrowRight':   RetroJoypad['Right'],
        'Tab':          RetroJoypad['Select'],
        'Enter':        RetroJoypad['Start'],
        'q':            RetroJoypad['L'],
        'e':            RetroJoypad['R']
    }
};

export default Keyboard;
