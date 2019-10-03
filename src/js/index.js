/**
 * @type {Ws|null}
 */
let ws = undefined;

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
        if (Number(data.isSecondary)) cl += " small_message";


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

    static selectPM(nick, id) {
        $("#chat_service").text("ЛС для " + nick).removeClass("closed");
        $("#pm_id").val(id);
        $("#message_text").focus();
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
    class User {

        name = null;
        img = null;
        balance = null;

        constructor() {
            $.ajaxSetup({
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Token", getCookie("Token"));
                    xhr.setRequestHeader("User-Id", getCookie("User-Id"));
                }
            });
            this.getUserInfo();
            this.getAllSkins();
            this.getAllStickers();
        }

        getUserInfo() {
            sendRequest("api/user", {action: "get_user_info"})
                .then(data => {
                    if (data.result !== "true") return true;

                    data = data.data;
                    this.name = data.name;
                    this.balance = data.balance;
                    this.img = data.img;
                    this.fillUserInfo();
                });
        }

        fillUserInfo() {
            let accountDiv = $("#account_div");
            accountDiv.find("img").attr("src", this.img);
            accountDiv.find(".user_name").text(this.name);
            accountDiv.find(".user_balance").text(this.balance + " snl");
            $("#login").hide();
            $("#account_div").show();

        }

        getAllSkins() {
            sendRequest("api/user", {action: "get_user_skins"})
                .then(data => {
                    let html = "";
                    for (let skin of data.data) {
                        html += "<div class='user_skin' data-password='" + skin.password + "' data-nick='" + skin.nick + "'><div class='skin'><img src='" + skin.skin + "'></div><span>" + skin.nick + "</span></div>";
                    }
                    $("#all_skins .html").html(html);
                    $("#select_nick").html(html);
                });
        }

        getAllStickers() {
            sendRequest("api/user", {action: "get_user_stickers"})
                .then(data => {
                    let html = "";
                    for (let sticker of data.data) {
                        html += "<div class='user_sticker' data-id='" + sticker.id + "'><div class='skin'><img src='" + sticker.stickers[0].src + "'></div><span>" + sticker.name + "</span></div>"
                    }
                    $("#all_stickers .html").html(html);
                });
        }

    }

    let user = null;
    let userId = getCookie("User-Id");
    let token = getCookie("Token");
    if (!isEmpty(userId) && !isEmpty(token)) {
        sendRequest("api/registration", {action: "auth_by_token", token, user_id: userId})
            .then(data => {
                if (data.result !== "true") return true;
                user = new User();
            });
    }


    let resizeChat = false;


    document.getElementById("chat_service").addEventListener("transitionend", function () {
        if (+$("#chat_service").css("opacity")) {
            let allMessagesDiv = $("#all_messages");
            allMessagesDiv.animate({scrollTop: allMessagesDiv[0].scrollTop + $("#chat_service")[0].offsetHeight});
            return true;
        }

        $("#chat_service").html("");
        $("#pm_id").val("");
    });


    function getNick(nick) {
        sendRequest("api/registration", {action: "get_nick", nick})
            .then(data => {
                try {
                    if (data.result !== "true") throw("");
                    if (!+data.data.is_password) throw("");

                    if (+data.data.is_password) $("#password_for_game").addClass("required");
                    if (!isEmpty(data.data.skin)) {
                        $("#skin_preview").attr("src", data.data.skin).removeClass("closed");
                    } else $("#skin_preview").addClass("closed");
                    return true;
                } catch {
                }

                $("#skin_preview").addClass("closed");
                $("#password_for_game").removeClass("required");
            })
    }

    let getNickTimeOut = null;

    $("#resize_chat").mousedown(() => resizeChat = true);
    $("body").mouseup(() => resizeChat = false)
        .mousemove(function (event) {
            if (!resizeChat) return true;

            let height = window.innerHeight - 20 - event.clientY;
            if (height < 200) height = 200;
            $("#main_messages").css("height", height);
        })

        .on("click", "#play_button", () => $("#servers_list").addClass("show"))

        .on("click", "#all_messages .nick_name", function (event) {
            let parent = $(this).closest(".div_message");

            if (event.ctrlKey) {
                Message.selectPM(parent.attr("data-nick"), parent.attr("data-pid"));
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
            $("#selected_chat_nick").val(parent.attr("data-nick"));
        })

        .on("click", ".user_actions div:eq(0)", event => event.stopPropagation())

        .on("click", ".user_actions.user div:eq(1)", Message.hiddenUserMessage)
        .on("click", ".user_actions.user div:eq(2)", Message.highlightUser)
        .on("click", ".user_actions.user div:eq(3)", function () {
            let nick = $("#selected_chat_nick").val().trim();
            let id = $("#selected_chat_user").val().trim();
            if (!id || !nick) return true;

            Message.selectPM(nick, id);
        })
        .on("click", ".user_actions.user div:eq(4)", function () {
            let nick = $("#selected_chat_nick").val().trim();
            if (!nick) return true;

            $("#message_text").val(nick + ", ").focus();
        })
        .on("click", ".user_actions.user div:eq(5)", function () {
            let nick = $("#selected_chat_nick").val().trim();
            if (!nick) return true;

            navigator.clipboard.writeText(nick);
        })


        .on("click", ".user_actions.admin div:eq(3)", function () {
            let id = $("#selected_chat_user").val().trim();
            if (isEmpty(id)) return true;

            new Command("mute " + id);
        })

        .on("click", function () {
            $(".user_actions").addClass("closed");
            $("#select_nick").addClass("closed");
        })


        .on("click", ".player_online", function () {
            let nick = $(this).attr("data-nick");
            let id = $(this).attr("data-pid");

            $("#online_players").addClass("closed");
            Message.selectPM(nick, id);
        })

        .on("input", "#nick_for_game", function () {
            try {
                clearTimeout(getNickTimeOut);
            } catch {
            }
            let nick = $(this).val().trim();
            if (!nick) {
                $("#password_for_game").removeClass("required");
                return true;
            }

            getNickTimeOut = setTimeout(() => getNick(nick), 500);
        })

        .on("click", "#nick_for_game", event => {
            event.stopPropagation();
            $("#select_nick").removeClass("closed")
        })

        .on("click", "#select_nick .user_skin", function () {
            let parent = $(this).closest(".user_skin");
            let password = parent.attr("data-password") || "";
            let nick = parent.attr("data-nick");
            $("#nick_for_game").val(nick).trigger("input");
            $("#password_for_game").val(password);
        })

        .on("click", ".server", function () {
            $(".server.selected").not(this).removeClass("selected");
            $(this).addClass("selected");
        })

        .on("click", "#color_preview", () => $("#select_color").click())

        .on("change", "#select_color", function () {
            let color = $(this).val();
            let rgb = hexToRgb(color);
            let textColor = "white";
            if (rgb.brightness) textColor = "black";
            $("#color_preview").css({background: color, color: textColor}).text(color);
        })

        .on("click", "#personal_account", () => $("#user_account").toggleClass("closed"))

        .on("click", "#account_div", () => $("#exit_button").toggleClass("closed"))

        .on("click", "#all_skins .user_skin", function () {
            if (!ws || $(this).hasClass("selected")) return true;

            $("#all_skins .user_skin.selected").not(this).removeClass("selected");
            $(this).addClass("selected");
            ws.sendJson({
                action: "change_nick",
                nick: $(this).attr("data-nick"),
                password: $(this).attr("data-password") || ""
            });
        })

        .on("click", "#all_stickers .user_sticker", function () {
            if (!ws || $(this).hasClass("selected")) return true;

            $("#all_stickers .user_sticker").not(this).removeClass("selected");
            $(this).addClass("selected");
            let id = $(this).attr("data-id");
            ws.sendJson({
                action: "select_sticker_set",
                id
            })
        })

        .on("click", "#user_account", function () {
            $(this).addClass("closed");
        })

        .on("click", "#exit_button", function () {
            deleteCookie("Token");
            deleteCookie("User-Id");
        })

        .on("click", "#sign_in_button", function(){
            let userId = $("#login_sign_in").val().trim();
            let password = $("#password_sign_in").val().trim();
            if(isEmpty(userId) || isEmpty(password)) return true;

            sendRequest("api/registration", {action: "auth", "user_id":userId, password})
                .then(data => {
                    if(data.result === "true"){
                        setCookie("User-Id", data.data.user_id, {"max-age": 30 * 24 * 60 * 60});
                        setCookie("Token", data.data.token, {"max-age": 30 * 24 * 60 * 60});
                        user = new User();
                    }
                });
        });

}

window.addEventListener("load", onOpen);