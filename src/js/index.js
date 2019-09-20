class Message {
    static getNewMessage(data) {
        let isAdmin = Number(data.isAdmin);
        let isVerified = Number(data.isVerified);

        let cl = "no_icon";
        let pmClass = "";

        if (isAdmin) {
            cl = "admin";
        } else if (isVerified) cl = "verified";

        if (+data.pm) pmClass = "pm";

        $("#all_messages").append("<div class='div_message " + cl + " " + pmClass + "' data-pid='" + data.id + "'><span class='pm_icon'>ЛС</span><div class='icon'></div><span class='nick_name' style='color: " + data.color + "'>" + data.nick + ":</span><span class='message'> " + data.message + "</span></div>");
        $("#all_messages").stop().animate({scrollTop: $("#all_messages")[0].scrollHeight});
        // $("#all_messages")[0].scrollTop = $("#all_messages")[0].scrollHeight;
        if ($("#all_messages > div").length > 50) $("#all_messages > div:eq(0)").remove();
    }
}

function onOpen() {


    let resizeChat = false;
    let isCtrl = false;

    window.addEventListener("keydown", function (event) {
        let code = event.code.toLowerCase();
        if (["controlleft", "controlright"].includes(code)) isCtrl = true;
    });
    window.addEventListener("keyup", function (event) {
        let code = event.code.toLowerCase();
        if (["controlleft", "controlright"].includes(code)) isCtrl = false;
    });
    document.getElementById("chat_service").addEventListener("transitionend", function () {
        if (+$("#chat_service").css("opacity")) {
            let allMessagesDiv = $("#all_messages");
            allMessagesDiv.animate({scrollTop: allMessagesDiv[0].scrollTop + $("#chat_service")[0].offsetHeight});
            return true;
        }

        $("#chat_service").html("");
        $("#pm_id").val("");
    });

    $("#resize_chat").mousedown(() => resizeChat = true);
    $("body").mouseup(() => resizeChat = false)
        .mousemove(function (event) {
            if (!resizeChat) return true;

            let height = window.innerHeight - 20 - event.clientY;
            if (height < 200) height = 200;
            $("#main_messages").css("height", height);
        })

        .on("click", "#play_button", () => $("#servers_list").addClass("show"))

        .on("click", "#all_messages .nick_name", function () {
            let nick = $(this).text();

            if (isCtrl) {
                $("#chat_service").text("ЛС для " + nick).removeClass("closed");
                $("#pm_id").val($(this).parent(".div_message").attr("data-pid"));
            } else {
                let input = $("#message_text");
                input.val(input.val() + " " + nick.substr(0, nick.length - 1));
            }
            $("#message_text").focus();
        })

        .on("click", "#chat_service", function(){
            $("#chat_service").addClass("closed");
            $("#pm_id").val("");
        })

        .on("click", "#change_chat_color", () => $("#chat_color_input").click())

        .on("change", "#chat_color_input", function(){
            $("#main_messages").css("background", $(this).val());
        })

        .on("click", "#close_chat", function(){
            $("#main_messages").addClass("closed");
            $("#open_chat").removeClass("closed");
        })

        .on("click", "#open_chat", function(){
            $("#open_chat").addClass("closed");
            $("#main_messages").removeClass("closed");
        });


}

window.addEventListener("load", onOpen);