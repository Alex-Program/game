(function () {

    class Nick {
        constructor(id, nick, password, time, skinId, skin, isAdmin, isModer, userId, isTransparentSkin, isTurningSkin, isInvisibleNick, isRandomColor, isHelper, isGold, isClan, arrCount, isViolet, isRandomNickColor) {
            this.values = {};
            this.id = this.values.id = +id;
            this.nick = this.values.nick = nick;
            this.password = this.values.password = password;
            this.time = this.values.time = +time;
            this.skinId = this.values.skin_id = +skinId;
            this.skin = this.values.skin = skin;
            this.isAdmin = this.values.is_admin = +isAdmin;
            this.isModer = this.values.is_moder = +isModer;
            this.userId = this.values.user_id = String(userId);
            this.isTransparentSkin = this.values.is_transparent_skin = +isTransparentSkin;
            this.isTurningSkin = this.values.is_turning_skin = +isTurningSkin;
            this.isInvisibleNick = this.values.is_invisible_nick = +isInvisibleNick;
            this.isRandomColor = this.values.is_random_color = +isRandomColor;
            this.isHelper = this.values.is_helper = +isHelper;
            this.isGold = this.values.is_gold = +isGold;
            this.isClan = this.values.is_clan = +isClan;
            this.isViolet = this.values.is_violet = +isViolet;
            this.isRandomNickColor = this.values.is_random_nick_color = +isRandomNickColor;
            this.arrCount = +arrCount;
        }

        renderHtml() {
            let html = "<div class='nick flex_row' data-eq='" + this.arrCount + "'>";
            if (!isEmpty(this.skin)) html += "<img src='" + this.skin + "'>";
            html += "<span>" + this.nick + "</span></div>";
            return html;
        }

        getValue(name) {
            if (!(name in this.values)) return null;
            return this.values[name];
        }

    }

    let selectedNickEq = null;


    let searchFilters = {};
    let isRestrictSearch = true;

    /**
     * @type {[Nick]}
     */
    let allNicks = [];

    function getAllNicks() {
        allNicks = [];
        return sendRequest("api/admin", {action: "get_all_nicks"})
            .then(data => {
                if (data.result !== "true") return true;
                for (let n of data.data) {
                    let nick = new Nick(n.id, n.nick, n.password, n.time, n.skin_id, n.skin, n.is_admin, n.is_moder, n.user_id, n.is_transparent_skin, n.is_turning_skin, n.is_invisible_nick, n.is_random_color, n.is_helper, n.is_gold, n.is_clan, allNicks.length, n.is_violet, n.is_random_nick_color);
                    allNicks.push(nick);
                }
            });
    }

    function getNicksByFilters() {
        return allNicks.filter(nick => {

            for (let [filter, value] of Object.entries(searchFilters)) {
                let nickValue = nick.getValue(filter);
                if (filter === "nick") nickValue = nickValue.toLowerCase();
                if (Array.isArray(value)) {
                    if ((isRestrictSearch && !value.includes(nickValue) && filter !== "nick") || (filter === "nick" && !nickValue.includes(value[0]))) return false;
                    else if ((!isRestrictSearch && value.includes(nickValue) && filter !== "nick") || (filter === "nick" && nickValue.includes(value[0]))) return true;

                } else {
                    if (isRestrictSearch && value !== nickValue) return false;
                    else if (!isRestrictSearch && value === nickValue) return true;
                }


            }

            return isRestrictSearch || objectLength(searchFilters) === 0;
        });
    }

    async function renderNicks(isNeedUpdate = false) {
        if (isNeedUpdate) await getAllNicks();
        let arr = getNicksByFilters();
        let html = "";
        for (let nick of arr) {
            html += nick.renderHtml();
        }
        $("#all_skins").html(html);
    }

    renderNicks(true);


    $("body").on("click", "#show_nicks", function () {
        $("#search_filter input:not(.no)").each(function (i, el) {
            let name = $(el).attr("data-name");
            let type = $(el).attr("type");
            let value = type === "checkbox" ? +$(el).prop("checked") : $(el).val();
            if (isEmpty(value, true)) return delete searchFilters[name];

            if (type !== "checkbox") {
                if (name === "nick") value = [value.toLowerCase()];
                else value = value.split(",").map(v => !isNaN(v) ? +v : v.toLowerCase());
            }
            searchFilters[name] = value;
        });
        renderNicks();
    })

        .on("click", "#show_all_nicks", function () {
            $("#search_filter input:not(.no)").each(function (i, el) {
                let type = $(el).attr("type");
                (type === "checkbox") ? $(el).prop("checked", false) : $(el).val("");
            });
            searchFilters = {};
            renderNicks();
        })

        .on("click", "#reset_filter", function () {
            $("#search_filter input:not(.no)").each(function (i, el) {
                let name = $(el).attr("data-name");
                let type = $(el).attr("type");
                let val = "";
                if (name in searchFilters) {
                    val = type === "checkbox" ? Boolean(searchFilters[name]) : searchFilters[name].join(",");
                }
                (type === "checkbox") ? $(el).prop("checked", val) : $(el).val(val);
            });

        })

        .on("change", "input[data-name='is_no_restrict']", function () {
            isRestrictSearch = !$(this).prop("checked");
        })

        .on("click", ".nick", function () {
            selectedNickEq = +$(this).attr("data-eq");
            let nick = allNicks[selectedNickEq];
            $("#nick_info h3").text(nick.nick);
            $("#nick_info input").each(function (i, el) {
                let type = $(el).attr("type");
                let name = $(el).attr("data-name");
                let val = nick.getValue(name);
                (type === "checkbox") ? $(el).prop("checked", Boolean(val)) : $(el).val(val);
            });
            if (!isEmpty(nick.skin)) $("#nick_info img").attr("src", nick.skin);
            $("#nick_info").removeClass("closed");
        })

        .on("click", "#cancel_save_button", () => {
            selectedNickEq = null;
            $("#nick_info").addClass("closed");
        })

        .on("click", "#save_button", async function () {
            if (isEmpty(selectedNickEq) || !(selectedNickEq in allNicks)) return true;
            let nick = allNicks[selectedNickEq];
            let obj = {};
            $("#nick_info input").each(function (i, el) {
                let type = $(el).attr("type");
                let name = $(el).attr("data-name");
                let val = type === "checkbox" ? +$(el).prop("checked") : $(el).val();
                if (val === nick.getValue(name)) return true;
                obj[name] = val;
            });

            let src = $("#nick_image").attr("src");
            if (src !== nick.skin) {
                await new Promise(resolve => {
                    let image = new Image();
                    image.onload = () => {
                        let c = document.createElement("canvas");
                        [c.width, c.height] = [512, 512];
                        let ctx = c.getContext("2d");
                        ctx.clearRect(0, 0, c.width, c.height);
                        ctx.drawImage(image, 0, 0, c.width, c.height);
                        obj.skin = c.toDataURL("image/png", 1.0);
                        resolve();
                    };
                    image.src = src;
                });
            }

            if (objectLength(obj) === 0) return true;
            obj.action = "update_nick";
            obj.id = nick.getValue("id");

            sendRequest("api/admin", obj)
                .then(data => {
                    let message = "Ошибка";
                    if (data.result === "true") {
                        message = "Успешно";
                        $("#nick_info").addClass("closed");
                        renderNicks(true);
                    }

                    new Notify("Изменение ника", message);
                });

        })

        .on("click", "#nick_image", () => $("#image_input").click())

        .on("change", "#image_input", function () {
            let fileReader = new FileReader();
            fileReader.onload = () => $("#nick_image").attr("src", fileReader.result);
            fileReader.readAsDataURL(this.files[0]);
            $(this).val("");
        });

})();