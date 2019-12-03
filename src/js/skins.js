(function () {

    class Skin {

        constructor(id, nick, skinId = "", password = "", isAdmin = 0, isModer = 0, userId = getCookie("User-Id"), skin = "", count = 0, isTransparentSkin = 0, isTurningSkin = 0, isInvisibleNick = 0, isRandomColor = 0, isClan = 0) {
            this.id = id;
            this.nick = escapeHtml(nick);
            this.skinId = skinId;
            this.password = escapeHtml(password);
            this.isAdmin = isAdmin;
            this.isModer = isModer;
            this.userId = userId;
            this.isTransparentSkin = +isTransparentSkin;
            this.skin = skin;
            this.count = count;
            this.image = null;
            this.isTurningSkin = isTurningSkin;
            this.isInvisibleNick = isInvisibleNick;
            this.isRandomColor = isRandomColor;
            this.isClan = isClan;
        }

        renderHtml() {
            return "<div class='user_skin' data-eq='" + this.count + "'><span>" + this.nick + "</span></div>";
        }

        fillInputs() {
            $("#create_skin_button").hide();
            $("#change_skin_button").show();

            $("input[data-name='password']").val(this.password);
            $("input[data-name='nick']").val(this.nick).prop("readonly", true);
            $("input[data-name='is_transparent_skin']").prop("checked", Boolean(this.isTransparentSkin));
            $("input[data-name='is_turning_skin']").prop("checked", Boolean(this.isTurningSkin));
            $("input[data-name='is_invisible_nick']").prop("checked", Boolean(this.isInvisibleNick));
            $("input[data-name='is_random_color']").prop("checked", Boolean(this.isRandomColor));
            // $("#remove_image_button").hide();

            if (this.skin) {
                this.image = new Image();
                this.image.onload = () => canvas.loadImage(this.image);
                this.image.src = this.skin;


            } else canvas.noSkinText();

        }

        getValue(name) {
            if (name === "nick") return this.nick;
            else if (name === "skin") return this.skin;
            else if (name === "password") return this.password;
            else if (name === "is_transparent_skin") return Boolean(this.isTransparentSkin);
            else if (name === "is_turning_skin") return Boolean(this.isTurningSkin);
            else if (name === "is_invisible_nick") return Boolean(this.isInvisibleNick);
            else if (name === "is_random_color") return Boolean(this.isRandomColor);
            else if (name === "is_clan") return Boolean(this.isClan);
        }

        checkChanges(name, value) {
            let defaultValue = "";
            switch (name) {
                case "password":
                    defaultValue = this.password;
                    break;
                case "nick":
                    defaultValue = this.nick;
                    break;
                case "is_transparent_skin":
                    defaultValue = this.isTransparentSkin;
                    value = +value;
                    break;
                case "is_turning_skin":
                    defaultValue = this.isTurningSkin;
                    value = +value;
                    break;
                case "is_invisible_nick":
                    defaultValue = this.isInvisibleNick;
                    value = +value;
                    break;
                case "is_random_color":
                    defaultValue = this.isRandomColor;
                    value = +value;
                    break;
                case "is_clan":
                    defaultValue = this.isClan;
                    value = +value;
                    break;
                default:
                    defaultValue = this.id;
                    value = +value;
            }

            return defaultValue !== value;
        }

        changeValue(name, value) {
            if (name === "password") this.password = value;
            else if (name === "nick") this.nick = value;
            else if (name === "skin") this.skin = value;
            else if (name === "skin_id") this.skinId = value;
            else if (name === "is_transparent_skin") this.isTransparentSkin = +value;
            else if (name === "is_turning_skin") this.isTurningSkin = +value;
            else if (name === "is_invisible_nick") this.isInvisibleNick = +value;
            else if (name === "is_random_color") this.isRandomColor = +value;
            else if (name === "is_clan") this.isClan = +value;
        }

    }

    class Canvas {
        canvas = document.getElementById("skin_canvas");
        context = this.canvas.getContext("2d");
        /**
         * @type {HTMLImageElement|null}
         */
        image = null;

        constructor() {
            this.defaultText();
        }

        clear() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        drawText(text) {
            this.context.fillStyle = "#FFFFFF";
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.font = "bold 20px sans-serif";
            this.context.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
        }

        defaultText() {
            this.clear();
            this.fillBlack();
            this.drawText("Выберите изображение");
        }

        noSkinText() {
            this.clear();
            this.fillBlack();
            this.drawText("Скин не установлен");
        }

        fillBlack() {
            this.context.fillStyle = "#000000";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        loadImage(image) {
            this.image = image;

            this.drawImage();
        }

        drawImage() {
            if (!this.image) return false;

            this.clear();
            this.fillBlack();
            this.drawArc(this.canvas.width / 2, "gold");
            this.drawArc(this.canvas.width / 2 - 1, "#FFFFFF");

            this.context.save();
            this.context.clip();

            this.context.globalCompositeOperation = "source-atop";
            this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);

            this.context.restore();

            return true;
        }

        drawArc(radius, color = "#FFFFFF") {
            this.context.fillStyle = color;
            this.context.beginPath();
            this.context.arc(this.canvas.width / 2, this.canvas.height / 2, radius, 0, Math.PI * 2, true);
            this.context.fill();
            this.context.closePath();
        }

        removeImage() {
            if (!this.image) return false;

            this.image = null;
            this.defaultText();
        }

        toDataUrl() {
            if (!this.image) return false;
            let c = document.createElement("canvas");
            [c.width, c.height] = [512, 512];

            let ctx = c.getContext("2d");
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.drawImage(this.image, 0, 0, c.width, c.height);
            // this.clear();
            // this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
            let dataUrl = c.toDataURL("image/png", 1.0);
            this.drawImage();
            return dataUrl;
        }

    }

    let canvas = new Canvas();

    let skinsArr = [];
    let isChangedSkin = false;
    let selectedSkinCount = null;
    let isClan = false;

    let isChanged = {};
    let isCreated = {};

    function resetInputs() {
        $(".user_skin.selected").removeClass("selected");
        $("#nick_info input:not([type='checkbox'])").val("").prop("readonly", false);
        $("#nick_info input[type='checkbox']").prop("checked", false);
        canvas.defaultText();
        canvas.removeImage();
        $("#create_skin_button").show();
        $("#change_skin_button").hide();
        $("#remove_image_button").show();
        selectedSkinCount = null;
        isChangedSkin = false;
        isCreated = {};
        isChanged = {};
        $("#sum span:eq(0)").text("0");
        // $(".skin_tag:eq(0)").click();
    }

    resetInputs();


    function getAllSkins() {
        skinsArr = [];
        sendRequest("api/user", {action: "get_user_skins"})
            .then(data => {
                if (data.result !== "true") return false;

                let nicksHtml = "";
                let clansHtml = "";
                for (let skin of data.data) {
                    let s = new Skin(skin.id, skin.nick, skin.skin_id, skin.password, skin.is_admin, skin.is_moder, skin.user_id, skin.skin, skinsArr.length, +skin.is_transparent_skin, +skin.is_turning_skin, +skin.is_invisible_nick, +skin.is_random_color, +skin.is_clan);
                    skinsArr.push(s);
                    if (+skin.is_clan) clansHtml += s.renderHtml();
                    else nicksHtml += s.renderHtml();
                }
                $("#all_skins").html(nicksHtml);
                $("#all_clans").html(clansHtml);

            });
    }

    getAllSkins();

    let sum = 0;

    function countSum() {
        sum = 0;

        for (let [name, obj] of Object.entries({isChanged, isCreated})) {

            for (let changedKey in obj) {
                if (!obj[changedKey]) continue;

                let keysInPrice = {};
                if (name === "isCreated") keysInPrice = createToPrices;
                else if (name === "isChanged") keysInPrice = changeToPrices;

                if (!(changedKey in keysInPrice)) continue;
                let priceKey = keysInPrice[changedKey];
                if (isClan) priceKey = "clan_" + priceKey;
                if (!(priceKey in prices)) continue;
                sum += +prices[priceKey];
            }

        }


        $("#sum span:eq(0)").text(sum);
    }

    $("body").on("click", ".user_skin", function () {
        if ($(this).hasClass("selected")) return true;


        $(".user_skin.selected").removeClass("selected");
        $(this).addClass("selected");

        selectedSkinCount = $(this).attr("data-eq");
        skinsArr[selectedSkinCount].fillInputs();
        $("#sum span:eq(0)").text("0");
        isChanged = {};
        isCreated = {};
    })

        .on("click", "#create_skin", () => resetInputs())

        .on("click", "#add_image_button", () => $("#image_input").click())

        .on("change", "#image_input", function () {
            if (this.files.length < 1) return true;

            let fileReader = new FileReader();
            fileReader.onload = event => {
                let image = new Image();
                image.onload = () => canvas.loadImage(image);
                image.src = event.target.result;
            };
            fileReader.readAsDataURL(this.files[0]);

            if (selectedSkinCount !== null) {
                isChangedSkin = true;
                if (!skinsArr[selectedSkinCount].getValue("skin")) isCreated.skin = true;
                else isChanged.skin = true;
            } else isCreated.skin = true;

            $(this).val("");

            countSum();
        })

        .on("click", "#remove_image_button", function () {
            isChanged.skin = false;
            isCreated.skin = false;
            countSum();

            if (selectedSkinCount === null) return canvas.removeImage();

            isChangedSkin = false;
            if (!skinsArr[selectedSkinCount].image) return canvas.noSkinText();
            canvas.loadImage(skinsArr[selectedSkinCount].image);
        })

        .on("click", "#create_skin_button", function () {
            let obj = {
                action: "create_nick",
                is_clan: +isClan
            };
            $("#nick_info input").each(function (i, el) {
                let type = $(el).attr("type");
                let name = $(el).attr("data-name");
                obj[name] = type === "checkbox" ? +$(el).prop("checked") : $(el).val();
            });
            let skin = canvas.toDataUrl();
            if (skin) {
                obj.skin = skin;
            }

            if ((isEmpty(obj.password) && isEmpty(obj.skin)) || isEmpty(obj.nick)) return true;
            if (sum > user.balance) return new Notify("Создание ника", "Недостаточный баланс");


            sendRequest("api/user", obj)
                .then(data => {
                    let message = "Ошибка";

                    if (data.data === "exists") message = "Данный ник уже зарегистрирован";
                    else if (data.result === "true") {
                        message = "Ник создан";
                        resetInputs();
                        getAllSkins();
                    }
                    new Notify("Создание ника", message);
                });

        })

        .on("click", "#change_skin_button", function () {
            if (selectedSkinCount === null) return true;

            let obj = {};
            $("#nick_info input").each(function (i, el) {
                let type = $(el).attr("type");
                let name = $(el).attr("data-name");
                let value = type === "checkbox" ? +$(el).prop("checked") : $(el).val();
                if (!skinsArr[selectedSkinCount].checkChanges(name, value)) return true;

                obj[name] = value;
            });
            if (isChangedSkin) obj.skin = canvas.toDataUrl();
            if (objectLength(obj) === 0) return true;

            obj.id = skinsArr[selectedSkinCount].id;
            obj.is_clan = +isClan;
            obj.action = "change_nick";

            if (("nick" in obj && isEmpty(obj.nick)) || (isEmpty(obj.password) && (obj.remove_skin || !skinsArr[selectedSkinCount].image))) return true;
            if (sum > user.balance) return new Notify("Изменение ника", "Недостаточный баланс");
            if (obj.remove_skin) delete obj.skin;

            sendRequest("api/user", obj)
                .then(data => {
                    let message = "Ошибка";
                    if (data.data === "exists") message = "Данный ник уже зарегистрирован";
                    else if (data.result === "true") {
                        message = "Ник успешно изменен";
                        resetInputs();
                        getAllSkins();
                    }

                    new Notify("Изменение ника", message);

                });
        })

        .on("input", "#nick_info input", function () {
            let name = $(this).attr("data-name");
            let type = $(this).attr("type");
            let value = type === "checkbox" ? $(this).prop("checked") : $(this).val();

            if (selectedSkinCount !== null) {
                let currentValue = skinsArr[selectedSkinCount].getValue(name);

                if (isEmpty(currentValue) && !isEmpty(value)) isCreated[name] = true;
                else if (!isEmpty(currentValue) && currentValue !== value) isChanged[name] = true;
                else {
                    isCreated[name] = false;
                    isChanged[name] = false;
                }
            } else {
                isCreated[name] = !isEmpty(value);
            }

            countSum();
        })

        .on("click", "#skin_canvas", function () {
            if (!canvas.image) return true;
            openImage(canvas.image.src);
        })

        .on("click", ".skin_tag", function () {
            if ($(this).hasClass("selected")) return true;

            $(".skin_tag.selected").removeClass("selected");
            $(this).addClass("selected");
            let name = $(this).attr("data-name");
            $(".all_skins").hide();
            $(".all_skins[data-name='" + name + "']").show();
            isClan = name === "clans";
            resetInputs();
        });

})();