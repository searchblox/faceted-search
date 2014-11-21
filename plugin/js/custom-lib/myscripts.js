function shuffle(items) {
    var cached = items.slice(0), temp, i = cached.length, rand;
    while (--i) {
        rand = Math.floor(i * Math.random());
        temp = cached[rand];
        cached[rand] = cached[i];
        cached[i] = temp;
    }
    return cached;
}
function shuffleNodes(list) {
    var nodes = list.children, i = 0;
    nodes = toArray(nodes);
    nodes = shuffle(nodes);
    while (i < nodes.length) {
        list.appendChild(nodes[i]);
        ++i;
    }
}

function toArray(obj) {
    var array = [];
    // iterate backwards ensuring that length is an UInt32
    for (var i = obj.length >>> 0; i--;) {
        array[i] = obj[i];
    }
    return array;
}

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}

if (typeof String.prototype.trim != 'function') {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

if (typeof String.prototype.splitOnFirst != 'function') {
    String.prototype.splitOnFirst = function (str) {
        var d = this.indexOf(str);
        if (0 > d)return this;
        else {
            return [this.substr(0, d), this.substr(d + str.length)];
        }
    };
}
/**
 * Source: http://stackoverflow.com/a/22129960/2706988
 */
Object.resolve = function (path, obj) {
    if (!path || !obj) {
        throw new Error('path, obj is required');
    }
    return [obj].concat(path.split('.')).reduce(function (prev, curr) {
        return prev[curr];
    });
};
/**
 * Source: http://stackoverflow.com/a/18650828/2706988
 * @param {Number} bytes
 * @returns {Number|String} return string if @size is true, otherwise number
 */
function bytesToSize(bytes, size) {
    var result = 0,
        size = size || false;

    if(bytes == 0) return 0;

    var k = 1024,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));

    result = +(bytes / Math.pow(k, i)).toPrecision(3);

    if (size === true) {
        result += ' ' + sizes[i];
    }

    return result;
}