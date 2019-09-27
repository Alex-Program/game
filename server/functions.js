const request = require("request");

exports.getRandomInt = function (min, max) {
    return Math.round((max - min) * Math.random() + min);
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