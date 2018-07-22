/**
 * Map for storing the button name -> RetroPad ID relation. RetroPad IDs are based on those found in libretro.h
 * @see {@link https://github.com/libretro/RetroArch/blob/9c0ed0f2c4182f3df543a54881e68bb12cf2ed68/libretro-common/include/libretro.h#L186|LibRetro.h on GitHub} for RetroJoypad IDs.
 * @const
 */
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

export default RetroJoypad;
