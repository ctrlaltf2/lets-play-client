function Display() {
    var trueWidth = -1,
        trueHeight = -1;

    var canvas = document.getElementById('screen');
    var ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.oImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.filter = 'saturate(130%)'; // A little bit of saturation won't hurt (experimental feature so some stuff might not see this but its not important)

    this.update = function(blobURL) {
        var image = new Image();
        image.addEventListener('load', function() {
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
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            }
            URL.revokeObjectURL(blobURL);
        });
        image.src = blobURL;

    }

    this.drawSMPTEBars = function(canvas, ctx) {
        let width = canvas.width,
            height = canvas.height;


        let colors = [
            ['fff', 'ffe500', '00ffd7', '0fe000', 'ff00fe', 'e30013', '0000ff'],
            ['0000ff', '353535', 'ff00fe', '676767', '00ffd7', '353535', 'fff'],
            ['006261', 'fff', '00196b', '676767', '8d8d8d', '353535']
        ];

        let heights = [
            75,
            5,
            20
        ];

        let cX = 0, cY = 0;
        for(let row in colors) {
            let rowHeight = heights[row] / 100 * height;
            let cellWidth = width / colors[row].length;
            for(let i in colors[row]) {
                ctx.fillStyle = '#' + colors[row][i];
                ctx.fillRect(cX, cY, cellWidth, rowHeight);
                cX += cellWidth;
            }
            cY += rowHeight;
            cX = 0;
        }
        ctx.fillStyle = '#000';
        ctx.fillRect(0, (height - (height / 5) - (height * .05)) / 2, width, (height / 5) + (height * .05));

        ctx.font = Math.floor((height / 5 )) + 'px monospace';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText('NO SIGNAL', width / 2, height / 2);
    };
}

export default Display;
