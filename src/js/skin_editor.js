(function () {

    class Canvas {
        canvas = document.getElementById("canvas");
        context = this.canvas.getContext("2d");
        /**
         * @type {HTMLImageElement|null}
         */
        image = null;
        x = 0;
        y = 0;
        scale = 1;
        canvasX = this.canvas.getBoundingClientRect().left + document.getElementsByTagName("body")[0].scrollLeft;
        canvasY = this.canvas.getBoundingClientRect().top + document.getElementsByTagName("body")[0].scrollTop;

        constructor() {
            this.noImageText();
        }

        clear() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        noImageText() {
            this.clear();

            this.context.fillStyle = "#000000";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.context.fillStyle = "#FFFFFF";
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.font = "bold 20px sans-serif";
            this.context.fillText("Загрузите изображение", this.canvas.width / 2, this.canvas.height / 2);
        }

        fillBlack() {
            this.context.fillStyle = "#000000";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        getImageSize() {
            if (!this.image) return true;
            let dSize = this.image.naturalHeight / this.image.naturalWidth;
            let width = dSize >= 1 ? this.canvas.width : this.canvas.width / dSize;
            let height = width * dSize;
            return {width, height};
        }

        loadImage(image) {
            this.image = image;
            let size = this.getImageSize();
            let dWidth = size.width > this.canvas.width ? (size.width - this.canvas.width) / 2 : 0;
            let dHeight = size.height > this.canvas.height ? (size.height - this.canvas.height) / 2 : 0;


            [this.x, this.y, this.scale] = [-dWidth, -dHeight, 1];

            this.drawImage();
        }

        drawImage() {
            if (!this.image) return true;

            this.clear();
            this.fillBlack();

            this.context.fillStyle = "#FFFFFF";
            this.context.beginPath();
            this.context.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2, 0, Math.PI * 2, true);
            this.context.fill();
            this.context.closePath();

            this.context.save();
            this.context.clip();

            this.context.globalCompositeOperation = "source-atop";


            let size = this.getImageSize();
            this.context.drawImage(this.image, this.x, this.y, size.width * this.scale, size.height * this.scale);
            this.context.restore();


        }

        moveImage(dX, dY, scale = 0) {
            if (!this.image) return true;

            this.x += dX;
            this.y += dY;
            this.scale += scale;
            if (this.scale <= 0) this.scale = 0.01;
            this.drawImage();
        }

        toDataUrl() {
            if (!this.image) return false;
            this.clear();
            let size = this.getImageSize();
            this.context.drawImage(this.image, this.x, this.y, size.width * this.scale, size.height * this.scale);

            let dataUrl = this.canvas.toDataURL("image/png", 1);

            this.drawImage();

            return dataUrl;
        }

    }


    let canvas = new Canvas();

    let previousMouseCoords = {
        x: 0,
        y: 0
    };

    let isMoveImage = false;

    $("body").on("click", "#select_image", () => $("#image_input").click())

        .on("change", "#image_input", function () {
            if (this.files.length < 1) return true;

            let file = this.files[0];
            let fileReader = new FileReader();
            fileReader.onload = event => {
                let image = new Image();
                image.onload = () => canvas.loadImage(image);
                image.src = event.target.result;
            };
            fileReader.readAsDataURL(file);

            $(this).val("");
        })

        .on("mousedown", "#canvas", function (event) {
            if (!canvas.image) return true;

            previousMouseCoords.x = event.pageX;
            previousMouseCoords.y = event.pageY;
            isMoveImage = true;
            $("*").css("cursor", "move")
        })

        .on("mouseup", () => {
            isMoveImage = false;
            $("*").css("cursor", "");
        })

        .on("mousemove", function (event) {
            if (!isMoveImage) return true;
            canvas.moveImage(event.pageX - previousMouseCoords.x, event.pageY - previousMouseCoords.y);
            previousMouseCoords.x = event.pageX;
            previousMouseCoords.y = event.pageY;
        })

        .on("click", "#save_image", function () {
            let link = document.createElement("a");
            let href = canvas.toDataUrl();
            if (!href) return true;
            link.href = href;
            link.download = "skin.png";
            link.click();
        });


    document.getElementById("canvas").addEventListener("wheel", function (event) {
        event.preventDefault();
        let delta = 0.03;
        let dX = (canvas.canvasX + canvas.canvas.width / 2 - event.pageX) * 0.1;
        let dY = (canvas.canvasY + canvas.canvas.height / 2 - event.pageY) * 0.1;
        if (event.deltaY > 0) [dX, dY, delta] = [-dX, -dY, -delta];

        canvas.moveImage(dX, dY, delta);
    });

})();