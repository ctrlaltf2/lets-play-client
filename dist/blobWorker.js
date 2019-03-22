self.addEventListener('message', function(imgdata) {
    var blob = new Blob([imgdata.data], {type: 'image/jpeg'});
    self.postMessage(URL.createObjectURL(blob));
}, false);
