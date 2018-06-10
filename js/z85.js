// Adapted from https://github.com/noseglid/base85/blob/master/lib/base85.js
const NUM_MAXVALUE = Math.pow(2, 32) - 1;
const QUAD85 = 85 * 85 * 85 * 85;
const TRIO85 = 85 * 85 * 85;
const DUO85  = 85 * 85;
const SING85 = 85;

const Z85_DEC = {
    33: 68,
    35: 84,
    36: 83,
    37: 82,
    38: 72,
    40: 75,
    41: 76,
    42: 70,
    43: 65,
    45: 63,
    46: 62,
    47: 69,
    48: 0,
    49: 1,
    50: 2,
    51: 3,
    52: 4,
    53: 5,
    54: 6,
    55: 7,
    56: 8,
    57: 9,
    58: 64,
    60: 73,
    61: 66,
    62: 74,
    63: 71,
    64: 81,
    65: 36,
    66: 37,
    67: 38,
    68: 39,
    69: 40,
    70: 41,
    71: 42,
    72: 43,
    73: 44,
    74: 45,
    75: 46,
    76: 47,
    77: 48,
    78: 49,
    79: 50,
    80: 51,
    81: 52,
    82: 53,
    83: 54,
    84: 55,
    85: 56,
    86: 57,
    87: 58,
    88: 59,
    89: 60,
    90: 61,
    91: 77,
    93: 78,
    94: 67,
    97: 10,
    98: 11,
    99: 12,
    100: 13,
    101: 14,
    102: 15,
    103: 16,
    104: 17,
    105: 18,
    106: 19,
    107: 20,
    108: 21,
    109: 22,
    110: 23,
    111: 24,
    112: 25,
    113: 26,
    114: 27,
    115: 28,
    116: 29,
    117: 30,
    118: 31,
    119: 32,
    120: 33,
    121: 34,
    122: 35,
    123: 79,
    125: 80
};

/*
 * Decodes a z85 encoded string
 * @param {Buffer} input string to decode
 * @return {Boolean|Uint8Array} False if invalid str, uint8array with decoded data if successful decode
 */
function z85Decode(buffer) {
    const dataLength = buffer.length;

    if(dataLength % 5 !== 0)
        return false;

    var result = new Uint8Array(4 * Math.ceil(dataLength / 5));

    let writeIndex = 0;
    for(let i = 0; i < dataLength;) {
        let tuple = 0;
        let starti = i;

        tuple = (Z85_DEC[buffer.charCodeAt(i)]) * QUAD85;
        tuple += (++i >= dataLength ? 84 : Z85_DEC[buffer.charCodeAt(i)]) * TRIO85;
        tuple += (++i >= dataLength ? 84 : Z85_DEC[buffer.charCodeAt(i)]) * DUO85;
        tuple += (++i >= dataLength ? 84 : Z85_DEC[buffer.charCodeAt(i)]) * SING85;
        tuple += (++i >= dataLength ? 84 : Z85_DEC[buffer.charCodeAt(i)]);
        ++i;

        if(starti + 5 !== i)
            return false;

        if(tuple > NUM_MAXVALUE || tuple < 0)
            return false;

        // Unpack tuple
        const tupleBytes = [
            (tuple >> 24) & 0xff,
            (tuple >> 16) & 0xff,
            (tuple >> 8) & 0xff,
            tuple & 0xff
        ];

        tupleBytes.forEach(byte => result[writeIndex++] = byte);
    }

    return result;

};
