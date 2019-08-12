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

class Preloader{
    static start(){
        $("#preloader").removeClass("active closed").addClass("active");
    }

    static stop(){
        $("#preloader").addClass("closed");
    }
}