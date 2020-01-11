function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {

    options = {
        path: '/',
        ...options
    };

    if (options.hasOwnProperty("expires") && options.expires.toUTCString) {
        options.expires = options.expires.toUTCString();
    }

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }

    document.cookie = updatedCookie;
}

function deleteCookie(name) {
    setCookie(name, "", {
        'max-age': -1
    })
}


function sendRequest(url = "/", data = {}, method = "POST") {
    let json = JSON.stringify(data);

    return new Promise(function (resolve, reject) {
        $.ajax({
            method: method,
            url: url,
            async: true,
            data: {json},
            success: data => {
                try {
                    data = JSON.parse(data);
                    if (typeof (data) !== "object") throw("Error");
                } catch {
                    reject();
                }
                resolve(data)
            },
            error: () => reject()
        });
    });

}

function timeFormat(time = '', zone = false) {
    try {
        let date;
        if (!isNaN(time)) {
            zone = false;
            date = time * 1000;
        }

        let x = new Date();

        x.setTime(date);
        let day = x.getDate();
        let month = x.getMonth() + 1;
        let year = x.getFullYear();
        let hours = x.getHours();
        let minutes = x.getMinutes();
        let seconds = x.getSeconds();

        if (String(month).length === 1) month = "0" + String(month);
        if (String(day).length === 1) day = "0" + String(day);
        if (String(minutes).length === 1) minutes = "0" + String(minutes);
        if (String(hours).length === 1) hours = "0" + String(hours);
        if (String(seconds).length === 1) seconds = "0" + String(seconds);

        //// возвращаемый объект
        return {
            year,
            month,
            day,
            hours,
            minutes,
            seconds
        };
    } catch (e) {
        return time;
    }
}

function isEmpty(val, isDefault = false) {
    if (typeof val === "object") {
        for (let k in val) {
            return false;
        }
        return true;
    }
    if (typeof val === "number") return val === 0 && isDefault;
    if (typeof val === "bigint" || typeof val === "symbol" || typeof val === "function") return false;
    if (typeof val === "string") return val.trim() === "";
    if (typeof val === "boolean") return !val;
    if (typeof val === "undefined" || val === null || isNaN(val) || val === undefined) return true;

    return true;
}

function getObjByInput(selector) {
    let obj = {};
    $(selector).each(function (index, element) {
        let name = $(element).attr("data-name") || $(element).attr("name");
        let type = $(element).attr("type") || "text";

        if (type === "checkbox" || type === "radio") {
            obj[name] = +$(element).prop("checked");
        } else obj[name] = $(element).val();
    });

    return obj;
}

function escapeHtml(text) {
    'use strict';
    return text.replace(/[\"&<>]/g, function (a) {
        return {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}[a];
    });
}


/**
 * @param hex String
 * @return {{r: Number, b: Number, brightness: Boolean, g: Number}|null}
 */
function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    let brightness = (r >= 200 || g >= 200 || b >= 200);

    return {r, g, b, brightness};
}

function toChangeColor(hex) {
    let rgb = hexToRgb(hex);
    let arr = [rgb.r, rgb.g, rgb.b];
    if (rgb.brightness) arr = arr.map(v => v - 50);
    else arr = arr.map(v => v + 50);
    arr = new Uint8ClampedArray(arr);
    return rgbToHex(...arr);
}

function rgbToHex(...rgb) {
    for (let i = 0; i < 3; i++) {
        let hex = Number(rgb[i]).toString(16);
        if (hex.length < 2) hex = "0" + hex;
        rgb[i] = hex;
    }

    return "#" + rgb.join("");
}

function arrayBufferToString(buf) {
    // return String.fromCharCode.apply(null, new Uint8Array(buf));
    let textDecoder = new TextDecoder();
    return textDecoder.decode(buf);
}

function stringToArrayBuffer(str) {
    // let buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    // let bufView = new Uint8Array(buf);
    // for (let i = 0, strLen = str.length; i < strLen; i++) {
    //     bufView[i] = str.charCodeAt(i);
    // }
    // return buf;
    let textEncode = new TextEncoder("utf-8");
    return textEncode.encode(str);
}

function getRandomInt(min, max) {
    return Math.round((max - min + 1) * Math.random() + min - 0.5);
}

function objectLength(obj) {
    return Object.keys(obj).length;
}

function randomText(size){
    let str = "";
    for (let i = 0; i < size; i++) {
        let strCode = getRandomInt(33, 126);
        let symbol = String.fromCharCode(strCode);
        if (getRandomInt(0, 1)) symbol = symbol.toUpperCase();
        str += symbol;
    }
    return str;
}

function getRandomColor() {
    return rgbToHex(getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255));
}

class Preloader {
    static start() {
        $("#preloader").removeClass("active closed").addClass("active");
    }

    static stop() {
        $("#preloader").addClass("closed");
    }
}