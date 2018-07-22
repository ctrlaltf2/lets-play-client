const LetsPlayProtocol = {
    encode: function(cypher) {
        var command = "";
        for (var i = 0; i < cypher.length; i++) {
            var current = cypher[i];
            command += current.length + "." + current;
            command += (i < cypher.length - 1 ? "," : ";");
        }
        return command;
    },
    decode: function(string) {
        var pos = -1;
        var sections = [];
        for (let i =0;i < 25;++i) {
            var len = string.indexOf('.', pos + 1);
            if (len == -1) {
                break;
            }
            pos = parseInt(string.slice(pos + 1, len)) + len + 1;
            sections.push(string.slice(len + 1, pos)
                .replace(/&#x27;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/&#x2F;/g, '/')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
            )
            if (string.slice(pos, pos + 1) == ';') {
                break;
            }
        }
        return sections;
    }
}

export default LetsPlayProtocol;
