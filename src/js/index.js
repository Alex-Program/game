let ws = new Ws("ws://127.0.0.1:8081");

let hiddenUsersId = [];
let highlightedUsersId = [];

class Message {
    static getNewMessage(data) {
        let isAdmin = Number(data.isAdmin);
        let isVerified = Number(data.isVerified);

        let cl = "no_icon";

        if (isAdmin) {
            cl = "admin";
        } else if (isVerified) cl = "verified";

        if (+data.pm) cl += " pm";
        if (hiddenUsersId.includes(+data.id) && !isAdmin) cl += " hidden";
        if (highlightedUsersId.includes(+data.id) && !isAdmin) cl += " highlighted";
        if(Number(data.isSecondary)) cl += " small_message";


        $("#all_messages").append("<div class='div_message " + cl + "' data-pid='" + data.id + "' data-nick='" + data.nick + "' data-admin='" + isAdmin + "'><span class='pm_icon'>ЛС</span><div class='icon'></div><span class='nick_name' style='color: " + data.color + "'>" + data.nick + ":</span><span class='message'> " + data.message + "</span></div>");
        $("#all_messages").stop().animate({scrollTop: $("#all_messages")[0].scrollHeight});
        // $("#all_messages")[0].scrollTop = $("#all_messages")[0].scrollHeight;
        if ($("#all_messages > div").length > 50) $("#all_messages > div:eq(0)").remove();
    }

    static hiddenUserMessage() {
        let id = +$("#selected_chat_user").val().trim();
        if (isEmpty(id)) return false;
        if (hiddenUsersId.includes(id)) return true;

        hiddenUsersId.push(id);

        $(".div_message").each(function (index, element) {
            let isAdmin = +$(element).attr("data-admin");
            if (isAdmin) return true;

            let pid = +$(element).attr("data-pid");
            if (id === pid) $(element).addClass("hidden");
        });
    }

    static highlightUser() {
        let id = +$("#selected_chat_user").val().trim();
        if (isEmpty(id)) return false;
        if (highlightedUsersId.includes(id)) return true;

        highlightedUsersId.push(id);

        $(".div_message").each(function (index, element) {
            let isAdmin = +$(element).attr("data-admin");
            if (isAdmin) return true;

            let pid = +$(element).attr("data-pid");
            if (id === pid) $(element).addClass("highlighted");
        });
    }

    static gameMessage(message) {
        message = message.replace("\n", "<br>");
        let html = "<div class='game_message'><div>" + message + "</div></div>";
        $("#all_messages").append(html);
    }

}

class Command {
    commands = {
        add_mass: ["to_id", "mass"],
        break_player: ["to_id"],
        mute: ["target_id"]
    };

    constructor(command) {
        command = command.split(" ");
        this.params = command.splice(1);
        this.command = command[0];
        this.sendCmd();
    }

    sendCmd() {
        if (typeof ws === "undefined" || !ws) return false;
        if (!(this.command in this.commands)) return false;
        if (this.commands[this.command].length !== this.params.length) return false;

        let obj = {action: "send_command", command: this.command};
        for (let [i, param] of Object.entries(this.commands[this.command])) {
            obj[param] = this.params[i];
        }
        ws.sendJson(obj);
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
            let parent = $(this).closest(".div_message");

            if (isCtrl) {
                $("#chat_service").text("ЛС для " + parent.attr("data-nick")).removeClass("closed");
                $("#pm_id").val(parent.attr("data-pid"));
            } else {
                let input = $("#message_text");
                input.val(input.val() + " " + parent.attr("data-nick"));
            }
            $("#message_text").focus();
        })

        .on("click", "#chat_service", function () {
            $("#chat_service").addClass("closed");
            $("#pm_id").val("");
        })

        .on("click", "#clear_chat", () => $("#all_messages").empty())

        .on("click", "#close_chat", function () {
            $("#main_messages").addClass("closed");
            $("#open_chat").removeClass("closed");
        })

        .on("click", "#open_chat", function () {
            $("#open_chat").addClass("closed");
            $("#main_messages").removeClass("closed");
        })

        .on("contextmenu", ".nick_name", function (event) {
            $(".user_actions").addClass("closed");
            event.preventDefault();
            event.stopPropagation();
            let parent = $(this).closest(".div_message");
            let userActionsDiv = event.ctrlKey ? $(".user_actions.admin") : $(".user_actions.user");
            userActionsDiv.find("div:eq(0)").text(parent.attr("data-nick") + " (" + parent.attr("data-pid") + ")");
            userActionsDiv.css({top: event.clientY + 10, left: event.clientX + 10}).removeClass("closed");
            $("#selected_chat_user").val(parent.attr("data-pid"));
        })

        .on("click", ".user_actions div:eq(0)", event => event.stopPropagation())

        .on("click", ".user_actions.user div:eq(1)", Message.hiddenUserMessage)
        .on("click", ".user_actions.user div:eq(2)", Message.highlightUser)
        .on("click", ".user_actions.admin div:eq(3)", function () {
            let id = $("#selected_chat_user").val().trim();
            if (isEmpty(id)) return true;

            new Command("mute " + id);
        })

        .on("click", function () {
            $(".user_actions").addClass("closed");
        });


}

window.addEventListener("load", onOpen);