$(document).ready(function () {
    $.ajaxSetup({
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Token", getCookie("Token"));
            xhr.setRequestHeader("User-Id", getCookie("User-Id"));
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
        });


    $("#message_input")[0].addEventListener("keypress", function (event) {
        if (event.code.toLowerCase() === "enter") {
            $("#send_message_button").click();
            return true;
        }
    });

});


