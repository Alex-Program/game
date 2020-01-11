(function () {
    // console.log("Ðœâ€“Ðâ€¡Ðœâ„¢Ðœ".split("").reduce((a, s) => a + s.charCodeAt(0), 0));
    console.log(parseInt("C1FF0235638B", 16));

    class Chat {
        constructor() {
            this.messageInput = $("#chat_text_message");
            this.ws = new Ws("ws://127.0.0.1:8081");
            this.lastMessageTime = performance.now();
            this.selectedPId = null;
            this.isPm = false;
            this.setListeners();
        }

        setListeners() {
            this.ws.on("open", () => this.onOpen());
            this.ws.on("message", data => this.onMessage(data));
        }

        onOpen() {
            this.ws.sendJson({
                action: "auth",
                token: user.token,
                userId: user.userId
            });
        }

        onMessage(event) {
            let data = arrayBufferToString(event.data);
            try {
                data = JSON.parse(data);
                if (typeof data !== "object") throw("Error");
            } catch {
                return true;
            }

            if (data.action === "message") {
                delete data.action;
                this.getNewMessage(data);
                return true;
            }

            if (data.action === "get_all_users") {
                this.getAllUsers(data.users);
                return true;
            }

        }

        getAllUsers(users) {
            let html = "";
            for (let user of users) {
                html += "<div class='chat_user' data-pid='" + user.id + "' data-id='" + user.userId + "'>" + user.nick + "</div>";
            }
            $("#chat_right_block").html(html);
        }

        getNewMessage(data) {
            let isAdmin = +data.isAdmin;
            let cl = "message";
            if (isAdmin) cl += " admin";
            if (+data.userId === user.userId) cl += " from_user";
            else cl += " to_user";

            let html = `<div class="chat_message flex_row" data-nick="` + data.nick + `">
    <div class="chat_message_img"></div>
    <div class="chat_message_nick">` + data.nick + `:</div>
    <div class="chat_message_text">` + data.message + `</div>
</div>`;
            let div = $("#chat_messages_block > div");
            div.append(html).stop().animate({scrollTop: div[0].scrollHeight});
        }

        sendMessage() {
            if (performance.now() - this.lastMessageTime < 3000) return true;
            this.lastMessageTime = performance.now();
            let message = this.messageInput.val().trim();
            if (isEmpty(message)) return true;
            this.messageInput.val("");
            this.ws.sendJson({
                action: "message",
                isPm: +this.isPm,
                toId: +this.selectedPId,
                message
            });
            this.isPm = false;
            this.selectedPId = null;
        }

        selectUser(pId) {
            if (isEmpty(pId) || isNaN(pId)) pId = null;
            else pId = +pId;
            this.selectedPId = pId;
        }

        selectPmMessage() {
            this.isPm = true;
        }

        cancelPmMessage() {
            this.isPm = false;

        }

    }

    let chat = new Chat();

    $("body").on("click", "#chat_send_message", () => chat.sendMessage())

        .on("click", ".chat_message_nick", function () {
            let nick = $(this).closest(".chat_message").attr("data-nick");
            let chatInput = $("#chat_text_message");
            chatInput.val(chatInput.val() + nick);
        })

        .on("click", ".chat_user", function (event) {
            let pId = $(this).attr("data-pid");
            chat.selectUser(pId);
            if (event.ctrlKey) chat.selectPmMessage();
        });


    document.getElementById("chat_text_message").addEventListener("keypress", event => {
        event.stopPropagation();
        if (event.code.toLowerCase() === "enter") {
            chat.sendMessage();
            return true;
        }
    });

})();