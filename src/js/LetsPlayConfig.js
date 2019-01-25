function LetsPlayConfig() {
    var self = this;


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

    this.reload = function() {
        self.layout = JSON.parse(localStorage.getItem('layouts') || '{}');
    }

    this.save = function() {
        localStorage.setItem('layouts', JSON.stringify(self.layout || {}));
    }
}

export default LetsPlayConfig;
