self.addEventListener('message', function(imgdata) {
    let view = new DataView(imgdata.data, 1, imgdata.data.length);
    var blob = new Blob([view], {type: 'image/jpeg'});
    self.postMessage(URL.createObjectURL(blob));
}, false);
