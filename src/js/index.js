
class Message {
    static getNewMessage(data) {
        let isAdmin = Number(data.isAdmin);
        let isVerified = Number(data.isVerified);

        let backgroundClass = "";
        let verifiedClass = "verefied";

        if (isAdmin) {
            backgroundClass = "admin";
            verifiedClass = "admin_verified"
        } else if (isVerified) verifiedClass = "verified";

        $("#all_messages").append("<div class='" + backgroundClass + "'><div class='" + verifiedClass + "'></div><span class='nick_name'>" + data.name + "</span>: " + data.message + "</div>");
        $("#all_messages")[0].scrollTop = $("#all_messages")[0].scrollHeight;
        if ($("#all_messages > div").length > 50) $("#all_messages > div:eq(0)").remove();
    }
}

function onOpen() {

    const ws = new WebSocket("ws://localhost:8081");


    ws.onmessage = event => {
        let data = event.data;
        try {
            data = JSON.parse(data);
            if (typeof (data) !== "object") throw("Error");
            if (data.action === "send_message") return Message.getNewMessage(data.data)

        } catch (e) {
            return true;
        }


    };

    $("#send_message input")[0].addEventListener("keypress", function (event) {
        if (event.code.toLowerCase() !== "enter") return true;
        event.preventDefault();
        let self = this;


        let json = {
            action: "send_message",
            data: {
                message: $(self).val()
            }
        };
        json = JSON.stringify(json);
        ws.send(json);
        $(this).val("");

        return false;
    });


    let resizeChat = false;
    $("#resize_chat").mousedown(() => resizeChat = true);
    $("body").mouseup(() => resizeChat = false)
        .mousemove(function (event) {
            if (!resizeChat) return true;

            let height = window.innerHeight - 20 - event.clientY;
            if (height < 100) height = 100;
            $("#main_messages").css("height", height);
        });

}

window.addEventListener("load", onOpen);