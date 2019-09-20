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

exports.rgbToHex = function (...rgb) {
    for (let i = 0; i < 3; i++) {
        let hex = Number(rgb[i]).toString(16);
        if (hex.length < 2) hex = "0" + hex;
        rgb[i] = hex;
    }

    return "#" + rgb.join("");
};
