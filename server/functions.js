const request = require("request");

exports.getRandomInt = function (min, max) {
    return Math.round((max - min + 1) * Math.random() + min - 0.5);
};

exports.roundFloor = function (number, count = 2) {
    return Math.round(number * (10 ** count)) / (10 ** count);
};

exports.getAngle = function (sin, cos) {
    let angle = Math.asin(sin);
    if (cos < 0) angle = Math.PI - angle;

    return {
        radians: angle,
        degree: angle * 180 / Math.PI
    }
};

exports.degreeToRadians = function (degree) {
    return degree * Math.PI / 180;
};

exports.isEmpty = function (val) {
    if (typeof val === "number" || typeof val === "bigint" || typeof val === "function" || typeof val === "symbol") return false;
    if (typeof val === "string") return val === "";
    if (typeof val === "boolean") return !val;
    if (typeof val === "object") {
        for (let k in val) {
            return false;
        }
    }

    return true;
};

exports.rgbToHex = function (...rgb) {
    rgb = Array.from(new Uint8ClampedArray(rgb));
    for (let i = 0; i < 3; i++) {
        let hex = Number(rgb[i]).toString(16);
        if (hex.length < 2) hex = "0" + hex;
        rgb[i] = hex;
    }

    return "#" + rgb.join("");
};

exports.sendRequest = function (url, obj, method = "POST") {
    url = "http://game.pw/" + url;
    let options = {
        url,
        method,
        headers: {
            'Token': "elrjglkejrglkjekjwlkejflkwjelkfjwkleg",
            'User-Id': 0
        },
        form: {json: JSON.stringify(obj)}
    };
    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            try {
                body = JSON.parse(body);
                if (typeof body !== "object") throw("Error");

                resolve(body);
            } catch (e) {
            }
            reject("Error");
        });
    });
};

exports.arrayBufferToString = function (buf) {
    // return String.fromCharCode.apply(null, new Uint16Array(buf));
    let textDecoder = new TextDecoder();
    return textDecoder.decode(buf);
};

exports.stringToArrayBuffer = function (str) {
    // let buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    // let bufView = new Uint16Array(buf);
    // for (let i = 0, strLen = str.length; i < strLen; i++) {
    //     bufView[i] = str.charCodeAt(i);
    // }
    // return buf;
    let textEncode = new TextEncoder("utf-8");
    return textEncode.encode(str);
};

exports.getRandomColor = function () {
    return exports.rgbToHex(exports.getRandomInt(0, 255), exports.getRandomInt(0, 255), exports.getRandomInt(0, 255));
};

/**
 * @param hex String
 * @return {{r: Number, b: Number, brightness: Boolean, g: Number}|null}
 */
exports.hexToRgb = function (hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    let brightness = (r >= 200 || g >= 200 || b >= 200);

    return {r, g, b, brightness};
};

exports.toSignNumber = function (number, sign) {
    number = Math.abs(number);
    return sign < 0 ? -number : number;
};