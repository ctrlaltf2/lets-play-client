import KeyboardDefaults from './Keyboard.js'

function LetsPlayConfig() {
    var self = this;


    /*
     * var layoutV2 = {
     *  'keyboard': {
     *      'B': <RetroValue>
     *  },
     *  'Xbox One S Pad': {
     *      'button': {
     *          '0': <RetroValue>
     *      }
     *      'axes': {
     *          '0+': <RetroValue>
     *          '0-': <RetroValue>
     *      }
     *  }
     * }
    /*var layoutExample =
        {
            'keyboard': {
                buttons: [
                    {
                        name: 'B',
                        deviceValue: 'Enter',
                    }
                ],
                axes: [
                    {
                        name: 'Left Analog',
                        deviceValue: 0
                    }
                ]
            },
            'Xbox One S Pad': {
                buttons: [
                    {
                        name: 'B',
                        deviceValue: 0
                    },
                    {
                        name: 'A',
                        deviceValue: 1
                    }
                ]
            }
        };*/

    this.layout = JSON.parse(localStorage.getItem('layouts') || '{}');
    this.layout['keyboard'] = this.layout['keyboard'] || KeyboardDefaults;

    this.reload = function() {
        self.layout = JSON.parse(localStorage.getItem('layouts') || '{}');
        self.layout['keyboard'] = self.layout['keyboard'] || KeyboardDefaults;
    }

    this.save = function() {
        localStorage.setItem('layouts', JSON.stringify(self.layout || {}));
    }
}

export default LetsPlayConfig;
