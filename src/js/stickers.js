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
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
            // this.context.restore();
            let base64 = this.canvas.toDataURL("image/png", 1.0);
            this.drawImage();
            return base64;
        }
    }

    let canvasArr = [];

    $("canvas").each(function (index, element) {
        canvasArr.push(new Canvas($(element)[0]));
    });

    let userStickersId = [];
    sendRequest("api/user", {action: "get_user_stickers"})
        .then(data => {
            for (let sticker of data.data) userStickersId.push(+sticker.id);
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
                for (let stickerSet of data.data) {
                    let html = "<div class='sticker_set' data-id='" + stickerSet.id + "' data-info='" + JSON.stringify(stickerSet) + "'><img src='" + stickerSet.stickers[0].src + "'><div>" + stickerSet.name + "</div><span>" + stickerSet.price + "</span></div>";
                    $("#all_stickers").append(html);
                }

            });

    }

    // getStickersInGroup(0);

    $("body").on("click", "canvas", function () {
        if (!isAddSticker) return true;
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
                obj.stickers.push(canvas.saveImage());
            }

            sendRequest("/api/stickers", obj)
                .then(data => {
                    if (data.result !== "true") return new Notify("Создание стикеров", "Ошибка");

                    new Notify("Создание стикеров", "Стикеры успешно отправлены на модерацию");
                });
        })

        .on("click", ".sticker_set", function () {
            if ($(this).hasClass("selected")) return true;


            $(".sticker_set.selected").not(this).removeClass("selected");
            $(this).addClass("selected");
            let dataInfo = JSON.parse($(this).attr("data-info"));

            $("#price_of_sticker #price").text(dataInfo.price);
            isAddSticker = false;
            $("#add_stickers_div").hide();
            if (!userStickersId.includes(+dataInfo.id)) {
                $("#buy_sticker_div").css("display", "block");
            }

            let stickers = dataInfo.stickers;
            for (let [i, canvas] of Object.entries(canvasArr)) {
                canvas.loadImageBySrc(stickers[i].src);
            }
        });

    $(".sticker_group:eq(0)").click();
})();