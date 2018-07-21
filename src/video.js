var video = {
    trueWidth: -1,
    trueHeight: -1,
    onUpdate: function(imgdata) {
        let bytearray = new Uint8Array(imgdata);
        var binstr = Array.prototype.map.call(bytearray, function (ch) {
            return String.fromCharCode(ch);
        }).join('');
        let b64encoded = btoa(binstr);

        var image = new Image();
        image.addEventListener('load', function() {
            var canvas = document.getElementById('screen');
            if (canvas.getContext) {
                if(trueWidth != image.width || trueHeight != image.height) {
                    trueWidth = image.width;
                    trueHeight = image.height;

                    let aspectRatio = image.width / image.height;
                    // Better ways to do this, but Google doesn't know how to implement a standard...
                    let oneRem = parseFloat(getComputedStyle(document.documentElement).fontSize);
                    let maxCanvasHeight = parseFloat(window.getComputedStyle(document.getElementsByClassName('display-container')[0]).height) - (2 * oneRem);

                    let newWidth = aspectRatio * maxCanvasHeight;
                    let newHeight = maxCanvasHeight;

                    canvas.width = newWidth;
                    canvas.height = newHeight;

                    document.getElementById('screen').style.height = newHeight + 'px !important';
                    document.getElementById('screen').style.width = newWidth + 'px !important';
                }
                var ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            }
        });
        image.src = 'data:image/jpeg;base64,' + b64encoded;
    }
}

export default video;
