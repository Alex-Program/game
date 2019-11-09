(function () {
    let isAddSticker = false;

    class Canvas {
        image = null;

        constructor(canvas) {
            this.canvas = canvas;
            this.context = canvas.getContext("2d");

            this.selectImageText();
        }

        defaultText() {
            this.image = null;

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "#000000";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "#FFFFFF";
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.font = "10 Verdana";
            this.context.fillText("Загрузите изображение", this.canvas.width / 2, this.canvas.height / 2);
        }

        loadImage(image) {
            this.image = image;
            this.drawImage();
        }

        loadImageBySrc(src) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "#000000";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "#FFFFFF";
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.font = "10 Verdana";
            this.context.fillText("Загрузка...", this.canvas.width / 2, this.canvas.height / 2);

            let image = new Image();
            image.onload = () => this.loadImage(image);
            image.src = src;
        }

        selectImageText() {
            this.image = null;

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "#000000";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "#FFFFFF";
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.font = "10 Verdana";
            this.context.fillText("Выберите набор стикеров", this.canvas.width / 2, this.canvas.height / 2);
        }

        drawImage() {
            if (!this.image) return false;

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "#FFFFFF";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.beginPath();
            this.context.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2, 0, Math.PI * 2, true);
            this.context.fillStyle = "#000000";
            this.context.fill();
            this.context.closePath();
            this.context.save();
            this.context.clip();
            this.context.globalCompositeOperation = "source-atop";
            this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
            this.context.restore();
        }

        saveImage() {
            if (!this.image) return false;

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            let c = document.createElement("canvas");
            [c.width, c.height] = [512, 512];
            let ctx = c.getContext("2d");
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.drawImage(this.image, 0, 0, c.width, c.height);
            // this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
            // this.context.restore();
            let base64 = c.toDataURL("image/png", 1.0);
            this.drawImage();
            return base64;
        }
    }

    let canvasArr = [];

    $("canvas").each(function (index, element) {
        canvasArr.push(new Canvas($(element)[0]));
    });


    function getAllGroups() {
        sendRequest("api/stickers", {action: "get_all_groups"})
            .then(data => {
                if (data.result !== "true") return false;

                let groups = data.data;
                for (let group of groups) {
                    let html = "<div class='sticker_group' data-id='" + group.id + "'>" + group.name + "</div>";
                    $("#all_sticker_groups").append(html);
                }
            });
    }

    getAllGroups();

    function getStickersInGroup(groupId) {
        $("#all_stickers").empty();
        sendRequest("/api/stickers", {action: "get_group_stickers", group_id: groupId})
            .then(data => {
                let groupId = +$(".sticker_group.selected:eq(0)").attr("data-id");
                let html = "";
                for (let stickerSet of data.data) {
                    let price = user.stickers.includes(+stickerSet.id) ? "Куплено" : stickerSet.price;
                    html += "<div class='sticker_set' data-id='" + stickerSet.id + "' data-info='" + JSON.stringify(stickerSet) + "'><img src='" + stickerSet.stickers[0].src + "'><div>" + stickerSet.name + "</div><span>" + price + "</span>";
                    if (groupId === -2) {
                        let cl = "invalid";
                        if (+stickerSet.is_valid) cl = "valid";
                        html += "<span class='is_valid " + cl + "'></span>";
                    }
                    html += "</div>";
                }
                $("#all_stickers").html(html);


            });

    }

    // getStickersInGroup(0);

    $("body").on("click", "canvas", function () {
        if (!isAddSticker) {
            let eq = $(this).index("canvas");
            let image = canvasArr[eq].image;
            openImage(image.src);
            return true;
        }
        $(this).prev("input").click();
    })

        .on("change", ".sticker_image", function () {
            let index = $(this).index(".sticker_image");
            let files = this.files;
            if (files.length < 0 || files.length > 1) return true;

            let fileReader = new FileReader();
            fileReader.onload = event => {
                let image = new Image();
                image.onload = () => canvasArr[index].loadImage(image);
                image.src = event.target.result;
            };
            fileReader.readAsDataURL(files[0]);
        })

        .on("click", ".sticker_group", function () {
            if ($(this).hasClass("selected")) return true;

            $(".sticker_group.selected").not(this).removeClass("selected");
            $(this).addClass("selected");

            isAddSticker = false;
            $("#add_stickers_div").hide();
            $("#buy_sticker_div").hide();

            let groupId = $(".sticker_group.selected:eq(0)").attr("data-id");

            if (+groupId <= 0) $("#add_sticker").hide();
            else $("#add_sticker").show();

            getStickersInGroup(groupId);
            for (let canvas of canvasArr) canvas.selectImageText();
        })

        .on("click", "#add_sticker", function () {
            isAddSticker = true;
            $("#add_stickers_div").show();
            $("#buy_sticker_div").hide();

            for (let canvas of canvasArr) canvas.defaultText();
            $(".sticker_set.selected").removeClass("selected");
        })

        .on("click", "#add_sticker_button", function () {
            let groupId = +$(".sticker_group.selected:eq(0)").attr("data-id");
            let name = $("#sticker_name").val().trim();
            let stickerPrice = +$("#sticker_price").val().trim();
            if (!groupId || !name || !stickerPrice) return true;

            let obj = {
                action: "add_stickers",
                group_id: groupId,
                price: stickerPrice,
                stickers: [],
                name
            };
            for (let canvas of canvasArr) {
                let saveImage = canvas.saveImage();
                if (!saveImage) return false;
                obj.stickers.push(saveImage);
            }

            sendRequest("/api/stickers", obj)
                .then(data => {
                    if (data.result !== "true") return new Notify("Создание стикеров", "Ошибка");

                    new Notify("Создание стикеров", "Стикеры успешно отправлены на модерацию");
                    $(".sticker_group:eq(2)").click();
                });
        })

        .on("click", ".sticker_set", function () {
            if ($(this).hasClass("selected")) return true;


            $(".sticker_set.selected").removeClass("selected");
            $(this).addClass("selected");
            let dataInfo = JSON.parse($(this).attr("data-info"));
            let isValid = +dataInfo.is_valid;

            $("#price_of_sticker #price").text(dataInfo.price);
            isAddSticker = false;
            $("#add_stickers_div").hide();
            if (!user.stickers.includes(+dataInfo.id) || !isValid < 0) {
                $("#buy_sticker_div").css("display", "block");
            }

            let stickers = dataInfo.stickers;
            for (let [i, canvas] of Object.entries(canvasArr)) {
                canvas.loadImageBySrc(stickers[i].src);
            }
        })

        .on("click", "#buy_sticker_set", function () {
            let id = +$(".sticker_set.selected:eq(0)").attr("data-id");
            if (!id) return true;

            let price = +$("#price").text();
            if (user.balance < price) return new Notify("Покупка стикеров", "Недостаточный баланс");

            let json = {
                action: "buy_stickers",
                id
            };

            sendRequest("api/stickers", json)
                .then(data => {
                    let message = "Ошибка";
                    if (data.result === "true") {
                        message = "Успешно";
                    }

                    new Notify("Покупка стикеров", message);
                    $(".sticker_group:eq(2)").click();

                });
        });

    $(".sticker_group:eq(2)").click();
})();