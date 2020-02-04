(function () {

    class Instruments {
        selectedInstrument = "move";
        availableInstruments = {
            move: this.move,
            brush: this.brush.bind(this)
        };
        currentAngleData = {
            sin: null,
            cos: null
        };
        lastUseInstrumentCoords = {
            x: null,
            y: null
        };
        colors = {
            main: "#000000"
        };

        selectColor(name, color) {
            if (!(name in this.colors)) return true;
            this.colors[name] = color;
        }

        useInstrument(event) {
            if (this.selectedInstrument !== "move") canvas.isUsedInstrument = true;
            this.availableInstruments[this.selectedInstrument](event);
            previousMouseCoords.x = event.pageX;
            previousMouseCoords.y = event.pageY;
        }

        mouseDown(event) {
            let coords = canvas.getCanvasCoords(event.pageX, event.pageY);
            canvas.copyElement(coords.x, coords.y, 30);
            return true;
            if (!event.shiftKey) {
                previousMouseCoords.x = event.pageX;
                previousMouseCoords.y = event.pageY;
            }
            this.availableInstruments[this.selectedInstrument](event);
        }

        mouseUp(event) {
            if (["brush"].includes(this.selectedInstrument)) canvas.updateImage();
        }

        selectInstrument(name) {
            if (!(name in this.availableInstruments)) return true;
            this.selectedInstrument = name;
        }

        move(event) {
            canvas.moveImage(event.pageX - previousMouseCoords.x, event.pageY - previousMouseCoords.y);
        }

        brush(event) {
            let startCoords = canvas.getCanvasCoords(previousMouseCoords.x, previousMouseCoords.y);
            let endCoords = canvas.getCanvasCoords(event.pageX, event.pageY);
            let dX = endCoords.x - startCoords.x;
            let dY = endCoords.y - startCoords.y;
            let c = Math.sqrt(dX ** 2 + dY ** 2);
            let sin = dY / c || 0;
            let cos = dX / c || 0;
            c = Math.floor(c);
            for (let i = 0; i <= c; i += 5) {
                let x = startCoords.x + i * cos;
                let y = startCoords.y + i * sin;
                canvas.drawArc(x, y, this.colors.main, 10, 0.5);
                // canvas.copyElement(x, y, 10);
                // canvas.clearArc(x, y, 10);
            }
            // canvas.drawLine({startX: startCoords.x, startY: startCoords.y}, {endX: endCoords.x, endY: endCoords.y}, 10, "black");

        }

    }

    class Canvas {
        /**
         * @type {HTMLCanvasElement}
         */
        canvas = document.getElementById("canvas");
        /**
         * @type {HTMLCanvasElement}
         */
        backgroundCanvas = document.createElement("canvas");
        context = this.canvas.getContext("2d");
        backgroundContext = this.backgroundCanvas.getContext("2d");
        /**
         * @type {HTMLImageElement|null}
         */
        image = null;
        x = 0;
        y = 0;
        scale = 1;
        canvasX = this.canvas.getBoundingClientRect().left + document.getElementsByTagName("html")[0].scrollLeft;
        canvasY = this.canvas.getBoundingClientRect().top + document.getElementsByTagName("html")[0].scrollTop;
        isUsedInstrument = false;

        constructor() {
            this.noImageText();
        }

        getCanvasCoords(pageX, pageY) {
            return {
                x: pageX - this.canvasX,
                y: pageY - this.canvasY
            }
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
            //
            // let imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            // let pixels = imageData.data;
            // for (let i = 0; i < pixels.length; i += 4) {
            //     let r = pixels[i];
            //     let g = pixels[i + 1];
            //     let b = pixels[i + 2];
            //     pixels[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
            //     pixels[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
            //     pixels[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
            // }
            // this.context.putImageData(imageData, 0, 0,);
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

        drawArc(x, y, color, size, alpha) {
            this.context.beginPath();
            this.context.globalAlpha = alpha;
            this.context.fillStyle = color;
            this.context.arc(x, y, size, 0, Math.PI * 2, true);
            this.context.fill();
            this.context.closePath();
            this.context.globalAlpha = 1;
            this.context.save();
            this.context.clip();
            this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
            this.context.restore();
            this.context.beginPath();
            this.context.globalAlpha = alpha;
            this.context.fillStyle = color;
            this.context.arc(x, y, size, 0, Math.PI * 2, true);
            this.context.fill();
            this.context.closePath();
            this.context.globalAlpha = 1;
        }

        drawLine({startX, startY}, {endX, endY}, size, color) {
            this.context.beginPath();
            this.context.lineWidth = size;
            this.context.strokeStyle = color;
            this.context.moveTo(startX, startY);
            this.context.lineTo(endX, endY);
            this.context.stroke();
            this.context.closePath();
        }

        clearArc(x, y, size) {
            this.context.save();
            this.context.beginPath();
            this.context.arc(x, y, size, 0, Math.PI * 2, true);
            this.context.fill();
            this.context.closePath();
            this.context.clip();
            this.context.clearRect(x - size, y - size, size * 2, size * 2);
            this.context.restore();
        }

        copyElement(x, y, size) {
            this.clear();
            this.context.beginPath();
            this.context.globalAlpha = 0;
            this.context.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2, 0, Math.PI * 2, true);
            this.context.fill();
            this.context.closePath();
            this.context.clip();
            this.context.globalAlpha = 1;
            let ratio = this.canvas.width / (2 * size);
            let dX = ratio * (x - this.canvas.width / 2);
            let dY = ratio * (y - this.canvas.height / 2);
            this.context.drawImage(this.image, -dX, -dY, this.canvas.width * ratio, this.canvas.height * ratio);
            // console.log(this.canvas.toDataURL());
        }

        updateImage() {
            let image = new Image();
            image.onload = () => this.image = image;
            image.src = this.canvas.toDataURL("image/png", 1.0);
        }

    }


    let canvas = new Canvas();
    let instruments = new Instruments();

    let previousMouseCoords = {
        x: 0,
        y: 0
    };

    let isUseInstrument = false;

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

            instruments.mouseDown(event);


            previousMouseCoords.x = event.pageX;
            previousMouseCoords.y = event.pageY;
            isUseInstrument = true;
            $("*").css("cursor", "move")
        })

        .on("mouseup", event => {
            isUseInstrument = false;
            instruments.mouseUp(event);
            $("*").css("cursor", "");
        })

        .on("mousemove", function (event) {
            if (!isUseInstrument) return true;
            instruments.useInstrument(event);
            // canvas.moveImage(event.pageX - previousMouseCoords.x, event.pageY - previousMouseCoords.y);
            // previousMouseCoords.x = event.pageX;
            // previousMouseCoords.y = event.pageY;
        })

        .on("click", "#save_image", function () {
            let link = document.createElement("a");
            let href = canvas.toDataUrl();
            if (!href) return true;
            link.href = href;
            link.download = "skin.png";
            link.click();
        })

        .on("click", ".instrument:not(div)", function () {
            if ($(this).hasClass("selected")) return true;
            $(".instrument").removeClass("selected");
            $(this).addClass("selected");
            let name = $(this).attr("data-name");
            instruments.selectInstrument(name);
        })

        .on("click", "div.instrument", function () {
            $(this).prev("input").click();
        })

        .on("change", ".select_color", function () {
            let name = $(this).attr("data-name");
            let color = $(this).val();
            instruments.selectColor(name, color);
            $(this).next("div").css({background: color});
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