self.addEventListener('message', function(imgdata) {
    let view = new DataView(imgdata.data.data, 1, imgdata.data.data.length);
    var blob = new Blob([view], {type: 'image/jpeg'});
    self.postMessage({
        url: URL.createObjectURL(blob),
        id: imgdata.data.info,
    });
}, false);
