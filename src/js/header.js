Array.prototype.toNumber = function () {
    for (let i = 0; i < this.length; i++) {
        this[i] = +this[i];
    }
    return this;
};

$.ajaxSetup({
    beforeSend: function (xhr) {
        xhr.setRequestHeader("Token", getCookie("Token"));
        xhr.setRequestHeader("User-Id", getCookie("User-Id"));
    }
});


class User {
    stickers = [];
    name = "";
    img = "";
    isAdmin = false;
    balance = 0;
    level = 0;
    experience = 0;

    /**
     * @type {null|Promise}
     */

    constructor() {
    }

    start() {
        this.getUserInfo();
    }

    getUserInfo() {
        return sendRequest("api/user", {action: "get_user_info"})
            .then(data => {
                this.stickers = data.data.stickers.toNumber();
                this.name = data.data.name;
                this.img = data.data.img;
                this.isAdmin = Boolean(+data.data.is_admin);
                this.balance = +data.data.balance;
                this.level = +data.data.level;
                this.experience = +data.data.experience;
                return data;
            });
    }

}

let user = new User();
user.start();


let prices = {};

let createToPrices = {
    password: "create_pass",
    skin: "create_skin",
    is_transparent_skin: "transparent_skin",
    is_turning_skin: "turning_skin",
    is_invisible_nick: "invisible_nick",
    is_random_color: "random_color"
};
let changeToPrices = {
    skin: "change_skin",
    password: "change_pass",
    is_transparent_skin: "transparent_skin",
    is_turning_skin: "turning_skin",
    is_invisible_nick: "invisible_nick",
    is_random_color: "random_color"
};

function openImage(src) {
    let image = $("#image_preview img")[0];
    image.src = src;
    $("#image_preview").removeClass("closed");
}

$(document).ready(function () {


    {
        let page = window.location.pathname.substring(1);
        $(".menu_href[data-href='" + page + "']").addClass("selected");
    }


    sendRequest("api/user", {action: "get_all_prices"})
        .then(data => {
            for (let price of data.data) {
                prices[price.name] = price.price;
            }
        });


    function getMessage(data) {
        let cl = data.from === "from" ? "from_user" : "to_user";
        let html = `<div class="message ` + cl + ` admin">
                <div class="message_header"><div class="verified"></div><span>` + data.userName + `</span></div>
                <div class="message_text">` + data.message + `
                </div>
            </div>`;


        let div = $("#messages > div");
        let scrolled = div[0].scrollHeight - div[0].scrollTop >= div[0].clientHeight + 10;
        div.append(html);
        if (data.from === "from" || !scrolled) {
            div.animate({"scrollTop": div[0].scrollHeight - div[0].clientHeight}, 150);
        }
    }


    sendRequest("/api/user", {action: "get_user_info"})
        .then(data => {
            /**
             * @property img
             * @property name
             * @property balance
             */
            $(".user_name").text(data.data.name);
            $(".balance").text(data.data.balance);
            let image = new Image();
            image.onload = () => $(".user_img").attr("src", image.src);
            image.src = data.data.img;
        });


    let ws = new Ws("ws://127.0.0.1:8081");

    ws.on("message", function (event) {
        let data = "";
        try {
            data = JSON.parse(event.data);
            if (typeof (data) !== "object") throw("Error");
        } catch (e) {
            return true;
        }

        if (data.action === "message") return getMessage(data);
    });


    $("body").on("click", "#open_chat", function () {
        let messagesDiv = $("#messages > div");
        messagesDiv[0].scrollTop = messagesDiv[0].scrollHeight - messagesDiv[0].clientHeight;

        $(this).addClass("closed");
        $("#chat").removeClass("closed");
    })

        .on("click", "#close_chat", function () {
            $("#open_chat").removeClass("closed");
            $("#chat").addClass("closed");
        })

        .on("click", "#send_message_button", function () {
            let messageInput = $("#message_input");
            let message = messageInput.val();
            messageInput.val("");
            if (!message) return true;

            let json = {
                action: "message",
                message
            };
            json = JSON.stringify(json);
            ws.send(json);

        })

        .on("submit", "form", function (event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        })


        .on("click", "#user_info_header", function (event) {
            event.stopPropagation();
            $("#user_info_slide").toggleClass("closed");
        })

        .on("click", function () {
            $("#user_info_slide").addClass("closed");
        })


        .on("click", ".close_notification", function () {
            $(this).closest(".notification").stop().animate({
                "height": "0",
                "opacity": "0"
            }, 500, function () {
                $(this).remove();
            });
        })


        .on("input", "input", function () {
            this.checkValidity();
        })

        .on("click", ".menu_href", function () {
            window.location.pathname = $(this).attr("data-href");
        })

        .on("click", "#open_menu", function () {
            $(this).addClass("closed");
            $("#main_menu").removeClass("closed");
        })

        .on("mouseleave", "#main_menu", function () {
            $(this).addClass("closed");
            $('#open_menu').removeClass("closed");
        })

        .on("click", "#image_preview", function () {
            $(this).addClass("closed");
        });


    $("#message_input")[0].addEventListener("keypress", function (event) {
        if (event.code.toLowerCase() === "enter") {
            $("#send_message_button").click();
            return true;
        }
    });

});


