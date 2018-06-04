$('document').ready(function() {
    let screen = document.getElementById('screen');
    let ctx = screen.getContext('2d');
    screen.height *= 3;
    screen.width *= 3;
    drawSMPTEBars(screen, ctx);
});

function drawSMPTEBars(canvas, ctx) {
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
}
