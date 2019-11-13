(function () {

    class Canvas {
        /**
         * @type {HTMLCanvasElement}
         */
        canvas = document.getElementById("user_image_canvas");
        context = this.canvas.getContext("2d");
        /**
         * @type {null|HTMLImageElement}
         */
        image = null;

        constructor() {
            let image = new Image();
            image.onload = () => this.loadImage(image);
            image.src = "/src/images/account.png";
        }

        loadImage(image) {
            if (this.image && image.src === "/src/images/account.png") return true;

            this.image = image;
            this.drawImage();
        }

        clear() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }


        drawImage() {
            if (!this.image) return false;

            this.clear();
            this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        }

        toDataUrl() {
            if (!this.image) return null;

            let c = document.createElement("canvas");
            [c.width, c.height] = [512, 512];
            let ctx = c.getContext("2d");
            ctx.drawImage(this.image, 0, 0, c.width, c.height);
            return c.toDataURL("image/png", 1);
        }

    }

    let canvas = new Canvas();


    function getUserInfo() {
        user.getUserInfo().then(() => {
            let image = new Image();
            image.onload = () => canvas.loadImage(image);
            image.src = user.img || "/src/images/account.png";

            $("#user_name").val(user.name);
            $("#user_balance span:eq(0)").text(user.balance);
        });
    }

    getUserInfo();

    let isChangeImage = false;

    $("body").on("click", "#user_image", () => $("#image_input").click())

        .on("change", "#image_input", function () {
            if (this.files.length < 1) return true;

            isChangeImage = true;
            let fileReader = new FileReader();
            fileReader.onloadend = () => {
                let image = new Image();
                image.onload = () => canvas.loadImage(image);
                image.src = fileReader.result;
            };
            fileReader.readAsDataURL(this.files[0]);

            $(this).val("");
        })

        .on("click", "#save_user_image", function () {
            if (!isChangeImage) return true;

            let dataUrl = canvas.toDataUrl();
            if (!dataUrl) return true;

            isChangeImage = false;

            let obj = {
                action: "change_user_image",
                img: dataUrl
            };
            sendRequest("api/user", obj)
                .then(data => {
                    let message = "Ошибка";
                    if (data.result === "true") {
                        message = "Успешно";
                        getUserInfo();
                    }

                    new Notify("Изменение профиля", message);
                });

        })

        .on("click", "#cancel_user_image", function () {
            if (!isChangeImage) return true;
            isChangeImage = false;
            let image = new Image();
            image.onload = () => canvas.loadImage(image);
            image.src = user.img || "/src/images/account.png";
        })

        .on("click", "#to_transfer", () => $("#transfer_div").removeClass("closed"))

        .on("click", "#cancel_transfer", () => $("#transfer_div").addClass("closed"))

        .on("input", "#transfer_sum", function () {
            let val = $(this).val();
            if (isNaN(val) || !Number.isInteger(+val)) return $("#total_transfer_sum").val(0);
            $("#total_transfer_sum").val(Math.floor(1.1 * val));
        })

        .on("click", "#transfer_button", function () {
            let recipientId = $("#recipient_id").val().trim();
            let sum = $("#transfer_sum").val().trim();
            if (isNaN(sum) || sum < 1 || isNaN(recipientId) || recipientId < 1) return true;
            if (+recipientId === +getCookie("User-Id")) return new Notify("Перевод snl", "Вы указали свой ИД");

            let json = {
                action: "transfer_balance",
                recipient_id: recipientId,
                sum
            };

            sendRequest("api/user", json)
                .then(data => {
                    let message = "Ошибка";
                    if (data.data === "invalid_data") message = "Неверный ИД";
                    else if (data.result === "true") {
                        message = "Успешно";
                        getUserInfo();
                    }

                    new Notify("Перевод snl", message);
                });


        })

        .on("click", "#save_user_name", function(){
            let name = $("#user_name").val().trim();
            if(isEmpty(name) || name === user.name) return true;

            let json = {
                action: "change_user_name",
                name
            };

            sendRequest("api/user", json)
                .then(data => {
                    let message = "Ошибка";
                    if(data.data === "exists") message = "Данное имя занято";
                    else if(data.result === "true"){
                        message = "Успешно";
                        getUserInfo();
                    }

                    new Notify("Изменение профиля", message);
                });

        })

        .on("click", "#cancel_user_name", () => $("#user_name").val(user.name));

})();