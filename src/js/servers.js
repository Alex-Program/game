(function () {
    let serverInfo = {};
    let selectedServerId = null;

    sendRequest("api/registration", {action: "get_all_servers"})
        .then(data => {
            if (data.result !== "true") return false;

            let html = "";
            for (let server of data.data) {
                html += `
                    <div class="server flex_row">
                        <input type="hidden" data-name="id" value="` + server.id + `">
                        <input type="text" class="gold_input no_style" placeholder="Наименование" value="` + server.name + `" data-value="` + server.name + `" data-name="name">
                        <input type="text" class="gold_input no_style ip" placeholder="IP" value="` + server.ip + `" data-value="` + server.ip + `" data-name="ip">
                        <button class="button_green button save_button">Сохранить</button>
                        <button class="button_primary button cancel_button">Отмена</button>
                        <button class="button_red button delete_button">Удалить</button>
                        <div class="server_info"><img src="/src/images/information.png"></div>
                    </div>
                `;
            }

            $("#servers_list").html(html);
        });


    function closeServerInfo() {
        serverInfo = {};
        selectedServerId = null;
        $("#server_info").addClass("closed");
    }


    $("body").on("click", ".cancel_button", function () {
        let parent = $(this).closest(".server");

        parent.find("input").each(function (i, el) {
            if ($(el).attr("data-name") === "id") return true;

            $(el).val($(el).attr("data-value"));
        });

    })

        .on("click", ".save_button", function () {
            let parent = $(this).closest(".server");

            let obj = {
                action: "change_server"
            };
            parent.find("input").each(function (i, el) {
                let name = $(el).attr("data-name");
                let val = $(el).val();
                obj[name] = val;
            });

            sendRequest("api/servers", obj)
                .then(data => {
                    if (data.result !== "true") return new Notify("Изменение сервера", "Ошибка");

                    new Notify("Изменение сервера", "Успешно");
                    parent.find("input").each(function (i, el) {
                        let name = $(el).attr("data-name");
                        $(el).attr("data-value", obj[name]);
                    });

                });
        })

        .on("click", "#add_server", function () {
            let parent = $(this).closest(".server");

            let obj = {
                action: "add_server"
            };
            for (let input of parent.find("input")) {
                let name = $(input).attr("data-name");
                let value = $(input).val();
                if (!value) return true;

                obj[name] = value;
            }

            sendRequest("api/servers", obj)
                .then(data => {
                    if (data.result !== "true") return new Notify("Добавление сервера", "Ошибка");

                    new Notify("Добавление сервера", "Успешно");
                    let html = `
                    <div class="server flex_row">
                        <input type="hidden" data-name="id" value="` + data.data + `">
                        <input type="text" class="gold_input no_style" placeholder="Наименование" value="` + obj.name + `" data-value="` + obj.name + `" data-name="name">
                        <input type="text" class="gold_input no_style ip" placeholder="IP" value="` + obj.ip + `" data-value="` + obj.ip + `" data-name="ip">
                        <button class="button_green button save_button">Сохранить</button>
                        <button class="button_primary button cancel_button">Отмена</button>
                        <button class="button_red button delete_button">Удалить</button>
                        <div class="server_info"><img src="/src/images/information.png"></div>
                    </div>
                `;
                    $("#servers_list").append(html);
                    parent.find("input").val("");
                });

        })

        .on("click", ".delete_button", function () {
            let parent = $(this).closest(".server");
            let id = parent.find("input[data-name='id']").val();
            if (!id) return true;

            sendRequest("api/servers", {action: "delete_server", id})
                .then(data => {
                    if (data.result !== "true") return new Notify("Удаление сервер", "Ошибка");

                    new Notify("Удаление сервера", "Успешно");
                    parent.fadeOut(500, () => parent.remove());
                });

        })

        .on("click", "#cancel_add", function () {
            $(this).closest(".server").find("input").val("");
        })

        .on("click", "#send_global_message", function () {
            let message = $("#global_message").val().trim();
            if (!message) return true;

            let json = {
                action: "global_message",
                message
            };
            sendRequest("api/servers", json)
                .then(data => {
                    let message = "Ошибка";
                    if (data.result === "true") message = "Успешно";

                    new Notify("Глобальное сообщене", message);
                });
        })

        .on("click", ".server_info", function () {
            Preloader.start();
            serverInfo = {};

            let parent = $(this).closest(".server");
            let id = parent.find("input[data-name='id']").val();

            selectedServerId = id;

            let json = {
                action: "get_game_settings",
                id
            };

            sendRequest("api/servers", json)
                .then(data => {
                    serverInfo = data.data;
                    $("#server_info input").each(function (i, el) {
                        let name = $(el).attr("data-name");
                        $(el).val(data.data[name] || 0);
                    });

                    Preloader.stop();
                    $("#server_info").removeClass("closed");
                });
        })

        .on("click", "#cancel_server_info", () => closeServerInfo())

        .on("click", "#save_server_info", function () {
            if (isEmpty(selectedServerId)) return true;
            let obj = {};
            $("#server_info input").each(function (i, el) {
                let name = $(el).attr("data-name");
                let val = $(this).val();
                if (!(name in serverInfo) || +val === +serverInfo[name]) return true;
                obj[name] = +val;
            });
            if (!objectLength(obj)) return true;
            Preloader.start();

            obj.id = selectedServerId;
            obj.action = "update_game_settings";

            sendRequest("api/servers", obj)
                .then(data => {
                    Preloader.stop();
                    let message = "Ошибка";
                    if (data.result === "true") {
                        message = "Успешно";
                        closeServerInfo();
                    }

                    new Notify("Изменение сервера", message);
                });

        });

})();