(function () {

    class Skin {

        constructor(id, nick, skinId, password = "", isAdmin = 0, isModer = 0, userId = getCookie("User-Id"), skin = "", count = 0) {
            this.id = id;
            this.nick = escapeHtml(nick);
            this.skinId = skinId;
            this.password = escapeHtml(password);
            this.isAdmin = isAdmin;
            this.isModer = isModer;
            this.userId = userId;
            this.skin = skin;
            this.count = count;
            this.image = null;
        }

        renderHtml() {
            return "<div class='user_skin' data-eq='" + this.count + "'><span>" + this.nick + "</span></div>";
        }

        fillInputs() {
            $("#create_skin_button").hide();
            $("#change_skin_button").show();

            $("input[data-name='password']").val(this.password);
            $("input[data-name='nick']").val(this.nick).prop("readonly", true);
            // $("#remove_image_button").hide();

            if (this.skin) {
                this.image = new Image();
                this.image.onload = () => canvas.loadImage(this.image);
                this.image.src = this.skin;


            } else canvas.noSkinText();

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
                default:
                    defaultValue = this.id;
            }

            if (defaultValue !== value) return true;

            return false;
        }

        changeValue(name, value) {
            if (name === "password") this.password = value;
            else if (name === "nick") this.nick = value;
            else if (name === "skin") this.skin = value;
            else if (name === "skin_id") this.skinId = value;
        }

    }

    class Canvas {
        canvas = document.getElementById("skin_canvas");
        context = this.canvas.getContext("2d");
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
            this.clear();
            this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
            let dataUrl = this.canvas.toDataURL("image/png", 1.0);
            this.drawImage();
            return dataUrl;
        }

    }

    let canvas = new Canvas();

    let skinsArr = [];
    let isChangedSkin = false;
    let selectedSkinCount = null;

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
    }

    resetInputs();


    function getAllSkins() {
        skinsArr = [];
        sendRequest("api/user", {action: "get_user_skins"})
            .then(data => {
                if (data.result !== "true") return false;

                let html = "";
                for (let skin of data.data) {
                    let s = new Skin(skin.id, skin.nick, skin.skin_id, skin.password, skin.is_admin, skin.is_moder, skin.user_id, skin.skin, skinsArr.length);
                    skinsArr.push(s);
                    html += s.renderHtml();
                }
                $("#all_skins").html(html);

            });
    }

    getAllSkins();

    $("body").on("click", ".user_skin", function () {
        if ($(this).hasClass("selected")) return true;

        $(".user_skin.selected").removeClass("selected");
        $(this).addClass("selected");

        selectedSkinCount = $(this).attr("data-eq");
        skinsArr[selectedSkinCount].fillInputs();
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

            if (selectedSkinCount !== null) isChangedSkin = true;
            $(this).val("");
        })

        .on("click", "#remove_image_button", function () {

            if (selectedSkinCount === null) return canvas.removeImage();

            isChangedSkin = false;
            if(!skinsArr[selectedSkinCount].image) return canvas.noSkinText();
            canvas.loadImage(skinsArr[selectedSkinCount].image);
        })

        .on("click", "#create_skin_button", function () {
            let obj = {
                action: "create_nick"
            };
            $("#nick_info input").each(function (i, el) {
                let name = $(el).attr("data-name");
                let val = $(el).val();
                obj[name] = val;
            });
            let skin = canvas.toDataUrl();
            if (skin) {
                obj.skin = skin;
            }

            if ((isEmpty(obj.password) && isEmpty(obj.skin)) || isEmpty(obj.nick)) return true;


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
                let name = $(el).attr("data-name");
                let value = $(el).val();
                if (!skinsArr[selectedSkinCount].checkChanges(name, value)) return true;

                obj[name] = value;
            });
            if (isChangedSkin) obj.skin = canvas.toDataUrl();
            if (objectLength(obj) === 0) return true;

            obj.id = skinsArr[selectedSkinCount].id;
            obj.action = "change_nick";

            if (("nick" in obj && isEmpty(obj.nick)) || (isEmpty(obj.password) && (obj.remove_skin || !skinsArr[selectedSkinCount].image))) return true;
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
        });

})();