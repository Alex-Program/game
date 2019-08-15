(function () {


    class Canvas {
        canvas = document.getElementById("main_canvas");
        context = this.canvas.getContext("2d");
        image = null;
        x = 0;
        y = 0;
        background = "#000000";
        transparentSkin = false;
        scale = 1;

        constructor() {
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
            this.image = image;
            this.drawImage();
        }

        drawImage() {
            if (this.image === null) return true;
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = this.background;
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.beginPath();
            this.context.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2, 0, Math.PI * 2, false);
            this.context.fillStyle = "#000000";
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

    }

    let canvas = new Canvas();

    let selectedCanvas = false;
    let previousCoords = {
        x: 0,
        y: 0
    };

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


        .on("click", "#color_select_button", () => $("#color_select").click())

        .on("change", "#color_select", function () {
            let val = $(this).val();
            $("#color_select_button").text(val);
            canvas.background = val;
            canvas.drawImage();
        })

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

        .on("mousemove", function (event) {
            if (!selectedCanvas) return true;
            canvas.x += event.clientX - previousCoords.x;
            canvas.y += event.clientY - previousCoords.y;
            previousCoords.x = event.clientX;
            previousCoords.y = event.clientY;
            canvas.drawImage();
        });


    $("#main_canvas")[0].addEventListener("wheel", function (event) {
        if (canvas.image === null) return true;
        if (event.deltaY < 0) canvas.scale += 0.03;
        else canvas.scale -= 0.03;

        canvas.drawImage();

        event.preventDefault();
        return false;
    });

})();