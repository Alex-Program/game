(function () {


    class Canvas {

        canvas = document.getElementById("main_canvas");
        context = this.canvas.getContext("2d");
        image = null;
        x = 0;
        y = 0;
        colors = {
            background: "#000000",
            cell: "#FF0000"
        };
        transparentSkin = false;
        scale = 1;

        constructor() {
            let canvasPos = this.canvas.getBoundingClientRect();
            this.canvasPos = {
                x: canvasPos.left,
                y: canvasPos.top,
                center: {
                    x: canvasPos.left + this.canvas.width / 2,
                    y: canvasPos.top + this.canvas.height / 2
                }
            };
            this.defaultText();
        }

        defaultText() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "#000000";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "#FFFFFF";
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.font = "25px Verdana";
            this.context.fillText("Выберите скин либо", this.canvas.width / 2, this.canvas.height / 2);
            this.context.fillText("загрузите изображение", this.canvas.width / 2, this.canvas.height / 2 + 30);
        }

        loadImage(image) {
            this.x = 0;
            this.y = 0;
            this.scale = 1;
            this.image = image;
            this.drawImage();
        }

        drawImage() {
            if (this.image === null) return true;
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = this.colors.background;
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.beginPath();
            this.context.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2, 0, Math.PI * 2, false);
            this.context.fillStyle = this.colors.cell;
            if (this.transparentSkin) this.context.globalAlpha = 0;
            this.context.fill();
            this.context.closePath();
            this.context.globalAlpha = 1;
            this.context.save();
            this.context.clip();
            this.context.globalCompositeOperation = "source-atop";
            this.context.drawImage(this.image, this.x, this.y, this.canvas.width * this.scale, this.canvas.height * this.scale);
            this.context.restore();
        }

        saveImage() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.context.drawImage(this.image, this.x, this.y, this.canvas.width * this.scale, this.canvas.height * this.scale);
            // this.context.restore();
            let base64 = this.canvas.toDataURL("image/png", 1.0);
            this.drawImage();
            return base64;
        }

    }

    let canvas = new Canvas();

    let selectedCanvas = false;
    let previousCoords = {
        x: 0,
        y: 0
    };

    function getAllNicks() {
        sendRequest("api/user", {action: "get_user_skins"})
            .then(data => {
                if (data.result !== "true") {
                    new Notify("Загрузка ников", "Ошибка");
                    return true;
                }

                $("#user_nicks").empty();
                let nicks = data.data;
                for (let nick of nicks) {
                    let html = "<div class='nick' data-info='" + JSON.stringify(nick) + "'>" + nick.nick + "</div>";
                    $("#user_nicks").append(html);
                }
            });
    }

    getAllNicks();

    // select image
    $("body").on("click", "#select_file_button", () => $("#select_skin_image").click())

        .on("change", "#select_skin_image", function () {
            let files = this.files;
            if (files.length === 0) return true;

            let fileReader = new FileReader();
            fileReader.onload = event => {
                let image = new Image();
                image.onload = () => canvas.loadImage(image);
                image.src = event.target.result;
                $("#main_canvas").addClass("selected");
            };
            fileReader.readAsDataURL(files[0]);
        })


        // change color
        .on("click", ".color_select_button", function () {
            $(this).prev(".color_select").click()
        })

        // change color
        .on("change", ".color_select", function () {
            let val = $(this).val();
            let type = $(this).attr("data-type");
            $(this).next(".color_select_button").text(val);
            canvas.colors[type] = val;
            canvas.drawImage();
        })

        // change transparent skin
        .on("change click", "#is_transparent", function () {
            // if(canvas.image === null) return false;
            canvas.transparentSkin = Boolean(this.checked);
            canvas.drawImage();
        })


        // grab canvas image
        .on("mousedown", "#main_canvas", function (event) {
            if (canvas.image === null) return true;
            [previousCoords.x, previousCoords.y] = [event.clientX, event.clientY];
            $("*").css("cursor", "grabbing");
            selectedCanvas = true;
        })

        .on("mouseup", function () {
            $("*").css("cursor", "");
            selectedCanvas = false;
        })

        // move canvas image
        .on("mousemove", function (event) {
            if (!selectedCanvas) return true;
            canvas.x += event.clientX - previousCoords.x;
            canvas.y += event.clientY - previousCoords.y;
            previousCoords.x = event.clientX;
            previousCoords.y = event.clientY;
            canvas.drawImage();
        })


        /// open create nick menu
        .on("click", "#create_new_nick", function () {
            $("#nick_info form")[0].reset();
            $("#change_nick_button").parent().hide();
            $("#create_nick_button").parent().show();
            $("#nick_info h3").text("Создать ник");
            $("#change_skin").addClass("closed");
            $("#nick_info").removeClass("closed");
        })

        /// close nick menu
        .on("click", "#close_nick_info", () => $("#nick_info").addClass("closed"))

        .on("input", "input", function () {
            $(this).addClass("changed");
        })

        // create nick
        .on("click", "#create_nick_button", function () {
            let obj = {};
            $("#nick_info input").each(function (index, element) {
                let name = $(element).attr("data-name");
                let val;
                if ($(element).attr("type") === "checkbox") val = +$(element).prop("checked");
                else val = $(element).val();

                if (name === "skin" && val) val = canvas.saveImage();
                else if (name === "nick") val = val.substr(0, 15);
                obj[name] = val;
            });

            if (!obj.nick || (!obj.password && !obj.skin)) return false;

            obj.action = "create_nick";
            sendRequest("api/user", obj)
                .then(data => {
                    if (data.result !== "true") {
                        let msg = "Ошибка";
                        if (data.data === "exists") msg = "Данный ник уже существует";
                        new Notify("Создание ника", msg);
                        return true;
                    }

                    getAllNicks();
                    new Notify("Создание ника", "Ник успешно создан");
                });
        })


        /// select exists nick
        .on("click", ".nick", function () {
            $(".nick.selected").removeClass("selected");
            $(this).addClass("selected");
            let data = JSON.parse($(this).attr("data-info"));
            $("#change_skin input").prop("checked", false);
            $("#nick_info input").each(function (index, element) {
                let name = $(element).attr("data-name");
                if (!data.hasOwnProperty(name)) return true;

                if ($(element).attr("type") === "checkbox") {
                    if (+data[name] === 0) data[name] = false;
                    $(element).prop("checked", !isEmpty(data[name]));

                    if (name === "skin") $(element).change();
                } else $(element).val(data[name]);
            });
            if (!isEmpty(data.skin)) {
                let image = new Image();
                image.onload = () => canvas.loadImage(image);
                image.src = data.skin;
            }
            $("#change_nick_button").parent().show();
            $("#create_nick_button").parent().hide();
            $("#nick_info h3").text("Изменить ник");
            $("#nick_info").removeClass("closed");
        })

        .on("change", "input[data-name='skin']", function () {
            if (!$("#nick_id").val()) return true;

            if ($(this).prop("checked")) $("#change_skin").removeClass("closed");
            else $("#change_skin").addClass("closed");
        })

        .on("change", "input[data-name='change_skin']", function () {
            $("input[data-name='skin']").addClass("changed");
        })


        /// change nick
        .on("click", "#change_nick_button", function () {
            let obj = getObjByInput("#nick_info input.changed, #nick_id");
            if (obj.skin && obj.change_skin) {
                obj.skin = canvas.saveImage();
            } else {
                delete obj.skin;
                delete obj.change_skin;
            }

            if (isEmpty(obj.id) || (isEmpty(obj.password) && isEmpty(obj.skin)) || (isEmpty(obj.nick) && "nick" in obj)) {
                return false;
            }

            obj.action = "change_nick";
            sendRequest("api/user", obj)
                .then(data => {
                    if (data.result !== "true") {
                        let msg = "Ошибка";
                        if (data.data === "exists") msg = "Данный ник уже существует";
                        new Notify("Изменение ника", msg);
                        return true;
                    }

                    getAllNicks();
                    new Notify("Изменение ника", "Ник успешно изменен");
                });
        });


    /// zoom canvas image
    $("#main_canvas")[0].addEventListener("wheel", function (event) {
        if (canvas.image === null) return true;
        let byX = (canvas.canvasPos.center.x - event.clientX) / 20;
        let byY = (canvas.canvasPos.center.y - event.clientY) / 20;
        if (event.deltaY < 0) canvas.scale += 0.03;
        else {
            canvas.scale -= 0.03;
            [byX, byY] = [-byX, -byY];
        }
        canvas.x += byX;
        canvas.y += byY;

        canvas.drawImage();

        event.preventDefault();
        return false;
    });

})();