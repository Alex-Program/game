/**
 * @type {Ws|null}
 */
let ws = undefined;
let isGame = false;
let gameSettings = {};

let hiddenUsersId = [];
let highlightedUsersId = [];
let isAdmin = false;


function loadImage(imageName, src) {
    if (imagesArr[imageName] || imagesArr[imageName] === null) return false;

    imagesSrc[imageName] = src;
    imagesArr[imageName] = null;

    let hideImage = +gameSettings.hideImage;
    if (hideImage) return true;

    let image = new Image();

    let isLowImage = +gameSettings.isLowImage;

    if (isLowImage) {
        let backgroundCanvas = document.createElement("canvas");
        [backgroundCanvas.width, backgroundCanvas.height] = [128, 128];
        let backgroundContext = backgroundCanvas.getContext("2d");
        backgroundContext.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        image.onload = () => {
            backgroundContext.drawImage(image, 0, 0, backgroundCanvas.width, backgroundCanvas.height);

            src = backgroundCanvas.toDataURL("image/png", 1);
            let i = new Image();
            i.onload = () => imagesArr[imageName] = i;
            i.src = src;
        };
        image.src = "http://sandl.pw" + src;

        return true;
    }

    image.onload = () => imagesArr[imageName] = image;
    image.src = src;
}

function reloadImages() {
    imagesArr = {};
    for (let [name, src] of Object.entries(imagesSrc)) {
        loadImage(name, src);
    }
}

let imagesSrc = {};
let imagesArr = {};


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


        $("#all_messages").append("<div class='div_message " + cl + "' data-pid='" + data.id + "' data-nick='" + escapeHtml(data.nick) + "' data-admin='" + isAdmin + "'><span class='pm_icon'>ЛС</span><div class='icon'></div><span class='nick_name' style='color: " + escapeHtml(data.color) + "'>" + escapeHtml(data.nick) + ":</span><span class='message'> " + escapeHtml(data.message) + "</span></div>");
        Message.scrollChat();
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

        Message.scrollChat();
    }

    static selectPM(nick, id) {
        $("#chat_service").text("ЛС для " + nick).removeClass("closed");
        $("#pm_id").val(id);
        $("#message_text").focus();
    }

    static scrollChat() {
        $("#all_messages").stop().animate({scrollTop: $("#all_messages")[0].scrollHeight});
        if ($("#all_messages > div").length > 50) $("#all_messages > div:eq(0)").remove();
    }
}

class Command {
    commands = {
        add_mass: ["to_id", "mass"],
        break_player: ["to_id"],
        mute: ["target_id"],
        kick: ["target_id"],
        ban_ip: ["target_id"],
        ban_account: ["target_id"],
        tp_coords: ["target", "x", "y"]
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


function setLocalNick(nick, password = "") {
    localStorage.setItem("nick", JSON.stringify({nick, password: password || ""}));
}

function getLocalNick() {
    let n = localStorage.getItem("nick");
    let obj = {
        nick: "",
        password: ""
    };
    if (!n) return obj;
    n = JSON.parse(n);
    obj.nick = n.nick;
    obj.password = n.password;
    return obj;
}

function setLocalColor(color) {
    localStorage.setItem("color", color);
}

function getLocalColor() {
    let c = localStorage.getItem("color");
    return c || "#FFD700";
}

function changeColor(color) {
    if (!ws) return true;
    ws.sendJson({
        action: "change_color",
        color
    });
}

function changeNick(nick, password = "") {
    setLocalNick(nick, password);

    if (!ws) return true;
    ws.sendJson({
        action: "change_nick",
        nick,
        password
    });

    addLocalNick(nick, password);
}

function addLocalNick(nick, password) {
    if (isEmpty(nick)) return false;
    let nicks = getLocalNicks() || [];
    for (let [key, n] of Object.entries(nicks)) {
        if (n.nick.toLowerCase() === nick.toLowerCase()) {
            nicks[key].password = password;
            localStorage.setItem("nicks", JSON.stringify(nicks));
            User.getLocalSkins();
            return true;
        }
    }
    nicks.push({nick, password});
    localStorage.setItem("nicks", JSON.stringify(nicks));
    User.getLocalSkins();
}

function getLocalNicks() {
    let nicks = localStorage.getItem("nicks");
    if (isEmpty(nicks)) return null;
    let returned = "";
    try {
        returned = JSON.parse(nicks);
    } catch {
        return null;
    }

    return returned;
}

function getNickInfo(nick) {
    return sendRequest("api/registration", {action: "get_nick", nick})
        .then(data => {
            try {
                if (data.result !== "true") throw("");

                return data.data;
            } catch {
            }

            return null;
        })
}

function deleteLocalNick(nick) {
    let nicks = getLocalNicks() || [];
    for (let [key, n] of Object.entries(nicks)) {
        if (n.nick.toLowerCase() === nick.toLowerCase()) {
            nicks.splice(key, 1);
            localStorage.setItem("nicks", JSON.stringify(nicks));
            break;
        }
    }
}

function onDeleteLocalNick(nick) {
    deleteLocalNick(nick);
    $(".local_skins .user_skin, #select_nick .local .user_skin").each(function (i, element) {
        let n = $(element).attr("data-nick");
        if (n.toLowerCase() === nick.toLowerCase()) $(element).remove();
    });
}

function getSettings() {
    let settings = localStorage.getItem("settings");
    if (!settings) return false;
    try {
        settings = JSON.parse(settings);
    } catch {
        return false;
    }

    return settings;
}

function loadGameSettings() {
    let settings = getSettings() || {};

    for (let [key, value] of Object.entries(settings)) {
        if (!isNaN(+value)) gameSettings[key] = +value;
        else gameSettings[key] = value;
    }

}

function setGameSetting(name, value) {
    let settings = getSettings() || {};
    if (!isNaN(+value)) {
        settings[name] = +value;
        gameSettings[name] = +value;
    } else {
        settings[name] = value;
        gameSettings[name] = value;
    }

    localStorage.setItem("settings", JSON.stringify(settings));
}

function fillGameSettings() {
    let settings = getSettings() || {};

    for (let [key, value] of Object.entries(settings)) {
        let input = $("#game_settings input[data-name='" + key + "']");
        if (input.length < 1) continue;

        if (input.attr("type") === "checkbox") {
            input.prop("checked", Boolean(+value));

        } else input.val(value);

        input.change();
    }

    $("#select_color").val(getLocalColor()).change();
    let nick = getLocalNick();
    $("#nick_for_game").val(nick.nick).trigger("input");
    $("#password_for_game").val(nick.password);
}

let user = null;

// function onOpen() {
let localNicks = [];

class User {

    name = null;
    img = null;
    balance = null;
    userNicks = [];
    level = 0;
    experience = 0;

    constructor() {
        $.ajaxSetup({
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Token", getCookie("Token"));
                xhr.setRequestHeader("User-Id", getCookie("User-Id"));
            }
        });
        $(".for_user.closed").removeClass("closed");
        this.getUserInfo();

        if (!localSkinsPromise) this.getAllSkins();
        else {
            localSkinsPromise.then(() => this.getAllSkins());
        }
        this.getAllStickers();
        this.changeAccount();
    }

    onLogOut() {
        deleteCookie("Token");
        deleteCookie("User-Id");
        $(".for_user").addClass("closed");
        $("#account_div").hide();
        $("#login").show();
        $("#select_nick .html:not(.local)").empty();
        $("#user_nicks .user_skins").empty();
        $("#user_nicks .user_stickers").empty();
        $.ajaxSetup({
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Token", null);
                xhr.setRequestHeader("User-Id", null);
            }
        });
        this.changeAccount();
    }

    changeAccount() {
        if (!ws) return true;

        ws.sendJson({
            action: "change_account",
            token: getCookie("Token") || "",
            userId: getCookie("User-Id") || ""
        });
    }

    getUserInfo() {
        sendRequest("api/user", {action: "get_user_info"})
            .then(data => {
                if (data.result !== "true") return true;

                data = data.data;
                this.name = data.name;
                this.balance = data.balance;
                this.img = data.img;
                this.experience = data.experience;
                this.level = data.level;
                this.fillUserInfo();
            });
    }

    fillUserInfo() {
        let accountDiv = $("#account_div");
        accountDiv.find("img").attr("src", this.img);
        accountDiv.find(".user_level").text(this.level);
        if (isEmpty(this.img)) accountDiv.find("img").hide();

        accountDiv.find(".user_name").text(this.name);
        accountDiv.find(".user_balance").text(this.balance + " snl");
        $("#login").hide();
        $("#registration_div").hide();
        $("#account_div").show();

    }

    getAllSkins() {
        return sendRequest("api/user", {action: "get_user_skins"})
            .then(data => {
                let html = "";
                for (let skin of data.data) {
                    this.userNicks.push(skin.nick.toLowerCase());
                    html += "<div class='user_skin' data-password='" + skin.password + "' data-nick='" + skin.nick + "'>";
                    if(!isEmpty(skin.skin)) html += "<div class='skin'><img src='" + skin.skin + "'></div>";
                    html += "<span>" + skin.nick + "</span></div>";
                }
                $("#select_nick .html.local .user_skin").each((i, element) => {
                    let nick = $(element).attr("data-nick").toLowerCase();
                    if (this.userNicks.includes(nick)) $(element).remove();
                });

                $("#select_nick .html:not(.local)").html(html);
                $("#user_nicks .user_skins").html(html);
            });
    }

    getAllStickers() {
        sendRequest("api/user", {action: "get_user_stickers"})
            .then(data => {
                let html = "";
                for (let sticker of data.data) {
                    html += "<div class='user_sticker' data-id='" + sticker.id + "'><div class='skin'><img src='" + sticker.stickers[0].src + "'></div><span>" + sticker.name + "</span></div>"
                }

                $("#user_nicks .user_stickers").html(html);
            });
    }

    static async getLocalSkins() {
        let nicks = getLocalNicks() || [];
        let html = "";
        for (let skin of nicks) {
            // if (user && user.userNicks.includes(skin.nick.toLowerCase())) continue;
            localNicks.push(skin.nick.toLowerCase());
            let info = await getNickInfo(skin.nick);
            if (!info) info = {skin: ""};
            html += "<div class='user_skin' data-password='" + skin.password + "' data-nick='" + skin.nick + "'>";
            if (!isEmpty(info.skin)) html += "<div class='skin'><img src='" + info.skin + "'></div>";
            html += "<span>" + skin.nick + "</span><span class='delete'>x</span></div>";
        }
        $("#select_nick .html.local").html(html);
        $("#user_nicks .local_skins").html(html);
    }

}

/**
 * @type {Promise|null}
 */
let localSkinsPromise = null;
let userId = getCookie("User-Id");
let token = getCookie("Token");
if (!isEmpty(userId) && !isEmpty(token)) {
    sendRequest("api/registration", {action: "auth_by_token", token, user_id: userId})
        .then(data => {
            if (data.result !== "true") return true;
            user = new User();
        });
}
localSkinsPromise = User.getLocalSkins();

sendRequest("api/registration", {action: "get_all_servers"})
    .then(data => {
        if (data.result !== "true") return false;

        let html = "";
        for (let server of data.data) {
            html += "<div class='server' data-ip='" + server.ip + "'>" + server.name + "</div>";
        }
        $("#all_servers").html(html);
    });


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
                // if (!+data.data.is_password) throw("");

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

let changeSettings = false;
let isChangeColor = false;
let isMoveCoords = false;
let differentCoordsPosition = {x: 0, y: 0};

$("#resize_chat").mousedown(() => resizeChat = true);
$("#coords").mousedown(event => {
    let coords = $("#coords")[0].getBoundingClientRect();
    differentCoordsPosition.x = event.clientX - coords.left;
    differentCoordsPosition.y = event.clientY - coords.top;
    isMoveCoords = true
});
$("body").mouseup(() => {
    resizeChat = false;
    isMoveCoords = false;
})
    .mousemove(function (event) {
        if (isMoveCoords) {
            $("#coords").css({
                left: event.clientX - differentCoordsPosition.x,
                top: event.clientY - differentCoordsPosition.y
            });
            return true;
        }
        if (!resizeChat) return true;

        let height = window.innerHeight - 20 - event.clientY;
        if (height < 200) height = 200;
        $("#main_messages").css("height", height);
    })

    .on("click", "#play_button", () => $("#servers_list").addClass("show"))
    .on("click", "#collapse_servers", () => $("#servers_list").removeClass("show"))

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
        let userActionsDiv = (event.ctrlKey && isAdmin) ? $(".user_actions.admin") : $(".user_actions.user");
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
        if (isEmpty(id) || !nick) return true;

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


    .on("click", ".user_actions.admin div:eq(1)", function () {
        let id = $("#selected_chat_user").val().trim();
        if (isEmpty(id)) return true;

        new Command("ban_ip " + id);
    })

    .on("click", ".user_actions.admin div:eq(2)", function () {
        let id = $("#selected_chat_user").val().trim();
        if (isEmpty(id) || !ws) return true;

        new Command("kick " + id);
    })

    .on("click", ".user_actions.admin div:eq(3)", function () {
        let id = $("#selected_chat_user").val().trim();
        if (isEmpty(id)) return true;

        new Command("mute " + id);
    })

    .on("click", ".user_actions.admin div:eq(4)", function () {
        let id = $("#selected_chat_user").val().trim();
        if (isEmpty(id)) return true;

        new Command("break_player " + id);
    })

    .on("click", ".user_actions.admin div:eq(5)", function () {
        let id = $("#selected_chat_user").val().trim();
        if (isEmpty(id)) return true;

        new Command("ban_account " + id);
    })

    .on("click", function () {
        $(".user_actions, #select_nick, #controller_view, #select_music").addClass("closed");
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
            $("#skin_preview").addClass("closed");
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
        setLocalNick(nick, password);
    })

    .on("click", ".server", function () {
        $(".server.selected").not(this).removeClass("selected");
        $(this).addClass("selected");
    })

    .on("click", ".color_preview", () => {
        isChangeColor = true;
        $("#select_color").click();
    })

    .on("change", "#select_color", function () {
        let color = $(this).val();
        let borderColor = toChangeColor(color);
        let rgb = hexToRgb(color);
        let textColor = "white";
        if (rgb.brightness) textColor = "black";
        $(".color_preview").css({background: color, "border-color": borderColor, color: textColor});
        $("#color_preview").text(color);
        setLocalColor(color);
        changeColor(color);
    })

    .on("click", "#account_div", () => $("#exit_button").toggleClass("closed"))

    .on("click", "#exit_button", function () {
        user.onLogOut();
        user = null;
        User.getLocalSkins();
    })

    .on("click", "#sign_in_button", function () {
        let userId = $("#login_sign_in").val().trim();
        let password = $("#password_sign_in").val().trim();
        if (isEmpty(userId) || isEmpty(password)) return true;

        sendRequest("api/registration", {action: "auth", "user_id": userId, password})
            .then(data => {
                if (data.result === "true") {
                    setCookie("User-Id", data.data.user_id, {"max-age": 30 * 24 * 60 * 60});
                    setCookie("Token", data.data.token, {"max-age": 30 * 24 * 60 * 60});
                    user = new User();
                }
            });
    })

    .on("click", ".user_skin .delete", function (event) {
        event.stopPropagation();
        let nick = $(this).closest(".user_skin").attr("data-nick");
        onDeleteLocalNick(nick);
    })

    .on("keypress keyup keydown", "input", e => e.stopPropagation())

    .on("click", "#settings_gear", () => $("#game_settings").removeClass("closed"))

    .on("mouseleave", "#game_settings", function () {
        if (changeSettings) return true;
        $(this).addClass("closed");
    })

    .on("mouseleave", "#user_nicks", function () {
        if (isChangeColor) return true;
        $(this).addClass("closed");
    })

    .on("mouseenter", "#user_nicks", () => isChangeColor = false)

    .on("mouseenter", "#game_settings", () => changeSettings = false)

    .on("click", ".select_color_span", function () {
        $(this).prev(".select_color_input").click();
        changeSettings = true;
    })

    .on("change", ".select_color_input", function () {
        let color = $(this).val();
        let name = $(this).attr("data-name");
        let rgb = hexToRgb(color);
        let textColor = "white";
        if (rgb.brightness) textColor = "black";
        $(this).next(".select_color_span").css({background: color, color: textColor}).text(color);
        setGameSetting(name, color);
    })

    .on("change", ".toggle_settings", function () {
        $(this).blur();
        let value = +$(this).prop("checked");
        let name = $(this).attr("data-name");
        setGameSetting(name, value);
        if (name === "isLowImage" || name === "hideImage") reloadImages();
    })

    .on("click", "#controller_settings", event => {
        event.stopPropagation();
        $("#controller_view").removeClass("closed")
    })

    .on("click", "#music_button", function (event) {
        event.stopPropagation();
        $("#select_music").toggleClass("closed");
    })

    .on("input", "#audio_href", function () {
        let audio = $("#game_music")[0];
        audio.pause();
        audio.currentTime = 0.0;
        let href = $(this).val().trim();
        if (!href) {
            $(audio).hide();
            return true;
        }

        audio.src = href;
        $(audio).show();
    })

    .on("click", "#select_music", e => e.stopPropagation())

    .on("click", "#to_sign_up", function () {
        $("#login").hide();
        $("#registration_div").show();
    })

    .on("click", "#to_sign_in", function () {
        $("#registration_div").hide();
        $("#login").show();
    })

    .on("click", "#sign_up_button", function () {
        let name = $("#name_sign_up").val().trim();
        let password = $("#password_sign_up").val().trim();
        let repeatPassword = $("#repeat_password").val().trim();
        if (!name || !password || !repeatPassword) return true;

        if (password !== repeatPassword) return alert("Пароли не совпадают");

        let json = {
            action: "registration",
            name,
            password
        };

        sendRequest("api/registration", json)
            .then(data => {
                if (data.result !== "true") return true;

                setCookie("Token", data.data.token, {"max-age": 30 * 24 * 60 * 60});
                setCookie("User-Id", data.data.user_id, {"max-age": 30 * 24 * 60 * 60});

                user = new User();
            });
    })

    .on("input", "input", function () {
        this.checkValidity();
    })

    .on("click", "#show_account", () => $("#user_nicks").removeClass("closed"))

    .on("click", ".account_tag", function () {
        let target = $(this).attr("data-target");
        $("#user_nicks .toggle:not(." + target + ")").hide();
        $("#user_nicks ." + target).show();
        $("#user_nicks .account_tag").not(this).removeClass("selected");
        $(this).addClass("selected");
    })

    .on("click", "#user_nicks .user_skin", function () {
        if (!ws || $(this).hasClass("selected")) return true;
        $("#user_nicks .user_skin.selected").removeClass("selected");
        $(this).addClass("selected");
        let nick = $(this).attr("data-nick");
        let password = $(this).attr("data-password");
        changeNick(nick, password);
    })

    .on("click", "#user_nicks .user_sticker", function () {
        if (!ws || $(this).hasClass("selected")) return true;
        $("#user_nicks .user_sticker.selected").removeClass("selected");
        $(this).addClass("selected");
        let id = $(this).attr("data-id");
        ws.sendJson({
            action: "select_sticker_set",
            id
        });
    })

    .on("click", "#vk", () => window.open("https://vk.com/ssandll", "_blank"))

    .on("click", "#sandl", () => $("#main_buttons").toggleClass("closed"))

    .on("click", "#main_buttons > div", function () {
        let page = $(this).attr("data-page");
        window.open(page, "_blank");
    })

    .on("click", "#close_info", function () {
        $("#coords").addClass("closed");
        $("#open_info").removeClass("closed");
    })

    .on("click", "#open_info", function () {
        $(this).addClass("closed");
        $("#coords").removeClass("closed");
    });


{
    let body = document.getElementsByTagName("body")[0];
    for (let i = 0; i < 100; i++) {
        let image = $("<img/>");
        image.attr("src", "/src/images/star.png");
        image.addClass("star");
        image.css({top: getRandomInt(50, body.scrollHeight - 50), left: getRandomInt(50, body.scrollWidth - 50)});
        $("#main_menu").append(image);
    }
}


loadGameSettings();
fillGameSettings();

// }

// window.addEventListener("load", onOpen);