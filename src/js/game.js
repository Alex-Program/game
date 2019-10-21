(function () {

    function roundFloor(number, count = 2) {
        return Math.round(number * (10 ** count)) / (10 ** count);
    }

    function getAngle(sin, cos) {
        let angle = Math.asin(sin);
        if (cos < 0) angle = Math.PI - angle;

        return {
            radians: angle,
            degree: angle * 180 / Math.PI
        }
    }

    function degreeToRadians(degree) {
        return degree * Math.PI / 180;
    }

    function getTimeByDelta(delta) {
        return delta / gameInfo.perSecond;
    }

///////////////


    class Arc {

        constructor() {
            this.isShow = true;
        }

        getDrawable() {
            return {
                x: canvas.width / 2 + (this.x - gameInfo.centerX) / gameInfo.scale,
                y: canvas.height / 2 + (this.y - gameInfo.centerY) / gameInfo.scale
            }
        }

        render() {
            if (!this.isShow) return true;
            let name = this.constructor.name.toLowerCase();
            if (name === "food" && gameSettings.isHideFood) return true;

            let drawableX = canvas.width / 2 + (this.x - gameInfo.centerX) / gameInfo.scale;
            let drawableY = canvas.height / 2 + (this.y - gameInfo.centerY) / gameInfo.scale;

            if (drawableX < 0 || drawableX > canvas.width || drawableY < 0 || drawableY > canvas.height) return true;


            let color = this.color;
            let shadowColor = "#000000";

            if (name === "cell" && gameSettings.isCellColor) {
                if (!gameSettings.cellColor) color = "#000000";
                else color = gameSettings.cellColor;

            } else if (name === "food" && gameSettings.isFoodColor) {
                if (!gameSettings.foodColor) color = "#000000";
                else color = gameSettings.foodColor;

            } else if (name === "virus" && gameSettings.isVirusColor) {
                if (!gameSettings.virusColor) color = "#000000";
                else color = gameSettings.virusColor;

            } else if (name === "bullet" && gameSettings.isBulletColor) {
                if (!gameSettings.bulletColor) color = "#000000";
                else color = gameSettings.bulletColor;
            }


            // let textColor = rgb.brightness ? "#000000" : "#FFFFFF";
            // let strokeTextColor = rgb.brightness ? "#FFFFFF" : "#000000";

            let textColor = "#FFFFFF";
            let strokeTextColor = "#000000";

            if (gameSettings.isShadowColor && gameSettings.shadowColor) shadowColor = gameSettings.shadowColor;

            context.save();

            if (gameSettings.isShadowColor) {
                this.setShadow(shadowColor);
            }

            let radius = this.drawableRadius / gameInfo.scale;
            if (gameSettings.isDrawCellBorder) {
                this.drawArc(drawableX, drawableY, radius, toDarkColor(color));
                radius = (this.drawableRadius - 5) / gameInfo.scale;
                if (radius < 2) radius = 2;
                context.restore();
            }
            // let transparent = (name === "food" && imagesArr['food']);
            let transparent = false;
            this.drawArc(drawableX, drawableY, radius, color, transparent);

            context.restore();

            if (name === "cell") {
                let stickerI = this.owner.stickerI;
                let stickerSet = this.owner.stickersSet;
                if (stickerI !== null && stickerI >= 0 && stickerSet && imagesArr[stickerSet[stickerI].image_id]) {
                    this.drawImage(imagesArr[stickerSet[stickerI].image_id], drawableX, drawableY, radius);
                } else if (imagesArr[this.owner.skinId]) {
                    this.drawImage(imagesArr[this.owner.skinId], drawableX, drawableY, radius);
                }

                if (!gameSettings.isHideNick && !(gameSettings.isOptimization && this.mass < 500)) {
                    this.drawText(drawableX, drawableY, this.drawableRadius / (2 * gameInfo.scale), this.owner.nick, textColor, true, strokeTextColor);
                }
                drawableY += this.drawableRadius / (2 * gameInfo.scale);
                if (gameSettings.isCellMass && !(gameSettings.isOptimization && this.mass < 500)) {
                    this.drawText(drawableX, drawableY, this.drawableRadius / (3 * gameInfo.scale), Math.floor(this.mass), textColor);
                }
                return true;
            }

            if (name === "virus") {
                if (imagesArr['virus_arrow']) {
                    let q = (this.mass - 200) / 200;
                    this.drawImageByAngle(imagesArr['virus_arrow'], drawableX, drawableY, -225 + 270 * q);
                }
                this.drawText(drawableX, drawableY, this.drawableRadius / (3 * gameInfo.scale), Math.floor(this.mass), textColor);
                return true;
            }

            // if (name === "food" && imagesArr['food']) {
            //     this.drawImage(imagesArr['food'], drawableX, drawableY, radius * 2);
            // }

            if ((name === "food" || name === "bullet") && gameSettings.isAllMass) {
                this.drawText(drawableX, drawableY, this.drawableRadius / (1.5 * gameInfo.scale), Math.floor(this.mass), textColor);
            }
        }

        clear() {
            let drawable = this.getDrawable();
            if (drawable.x < 0 || drawable.x > canvas.width || drawable.y < 0 || drawable.y > canvas.height) return true;
            this.isShow = false;
        }

        setShadow(color, blur = 10, x = 0, y = 0) {
            context.shadowColor = color;
            context.shadowBlur = blur;
            context.shadowOffsetX = x;
            context.shadowOffsetY = y;
        }

        drawArc(x, y, radius, color, transparent = false) {
            context.beginPath();
            context.fillStyle = color;
            if (transparent) context.globalAlpha = 0;
            context.arc(x, y, radius, 0, 2 * Math.PI, false);
            context.fill();
            context.closePath();
            context.globalAlpha = 1;
        }

        drawImage(image, x, y, radius) {
            context.save();
            context.clip();
            context.globalCompositeOperation = "source-atop";
            context.drawImage(image, x - radius, y - radius, radius * 2, radius * 2);
            context.restore();
        }

        drawImageByAngle(image, x, y, angle) {
            context.save();

            context.translate(x, y);
            context.rotate(degreeToRadians(angle));
            context.clip();

            context.globalCompositeOperation = "source-atop";
            context.drawImage(image, -this.drawableRadius / gameInfo.scale, -this.drawableRadius / gameInfo.scale, this.drawableRadius * 2 / gameInfo.scale, this.drawableRadius * 2 / gameInfo.scale);
            context.restore();
        }

        drawText(x, y, size, value, color = "#FFFFFF", isStroke = false, strokeStyle = "#000000", isShadow = false, shadowColor = "red") {
            if (+gameSettings.isBigText) size *= 1.8;
            else size *= 1.2;

            context.save();

            if (isShadow) {
                this.setShadow(shadowColor);
            }

            let font = gameSettings.isOptimization ? "'sans-serif'" : "'Caveat'";

            context.fillStyle = color;
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = "bold " + String(size) + "px " + font;
            context.fillText(String(value), x, y);
            if (isStroke) {
                context.lineWidth = size / 50;
                context.strokeStyle = strokeStyle;
                context.strokeText(String(value), x, y);
            }
            context.restore();
        }

        get drawableRadius() {
            return Math.sqrt(this.mass / Math.PI) * 3;
        }

        get radius() {
            let toMass = this.toMass || 0;
            return Math.sqrt((this.mass + toMass) / Math.PI) * 3;
        }

        set radius(val) {
            this.mass = Math.round(val * 10);
        }

        get speed() {
            return 20 / this.drawableRadius;
        }

        get mouseDist() {
            let differentX = this.owner.mouse.x - this.x;
            let differentY = this.owner.mouse.y - this.y;
            return Math.sqrt(differentX ** 2 + differentY ** 2);
        }

        get timeRatio() {
            return gameInfo.deltaTime / gameInfo.perSecond
        }

        outOfBorder() {
            return (this.x <= 0 || this.x >= gameInfo.width || this.y <= 0 || this.y >= gameInfo.height);
        }

        // static drawCompass() {
        //     let tg = gameInfo.centerY / gameInfo.centerX;
        //     let fY = tg * (x - gameInfo.centerX) + gameInfo.centerY;
        //     y = 0;
        //     x = 0;
        //     let intersectionTop = {
        //         y: 0,
        //         x: -gameInfo.centerY / tg + gameInfo.centerX
        //     };
        //     let intersectionLeft = {
        //         x: 0,
        //         y: -gameInfo.centerX * tg + gameInfo.centerY
        //     };
        //     let borderLeftX = gameInfo.centerX - canvas.width * gameInfo.scale / 2;
        //
        //     let intersection = {
        //         x: intersectionTop.x < borderLeftX ? 0 : intersectionTop.x,
        //         y: intersectionLeft.y < 0 ? 0 : intersectionLeft.y
        //     };
        //     context.beginPath();
        //     context.moveTo(canvas.width / 2, canvas.height / 2);
        //     context.lineTo(intersection.x, intersection.y);
        //     context.lineWidth = 10;
        //     context.stroke();
        //     context.closePath();
        // }
        //
        // static drawBorder() {
        //     let arr = [
        //         [0, 0],
        //         [gameInfo.width, 0],
        //         [gameInfo.width, gameInfo.height],
        //         [0, gameInfo.height]
        //     ];
        //
        //     context.beginPath();
        //     for (let [x, y] of arr) {
        //         let width = (x - gameInfo.centerX) / gameInfo.scale;
        //         let height = (y - gameInfo.centerY) / gameInfo.scale;
        //     }
        //
        // };

        static drawCenter() {
            if (!imagesArr["center"]) return true;

            let drawableX = canvas.width / 2 + (gameInfo.width / 2 - gameInfo.centerX) / gameInfo.scale;
            let drawableY = canvas.height / 2 + (gameInfo.height / 2 - gameInfo.centerY) / gameInfo.scale;
            if (drawableY < 0 || drawableY > canvas.height || drawableX < 0 || drawableX > canvas.width) return true;

            context.globalAlpha = 0;
            context.beginPath();
            context.arc(drawableX, drawableY, gameInfo.centerImageRadius / gameInfo.scale, 0, Math.PI * 2, true);
            context.fill();
            context.closePath();
            context.globalAlpha = 1;
            context.save();
            context.clip();
            context.globalCompositeOperation = "source-atop";
            context.drawImage(imagesArr["center"], drawableX - gameInfo.centerImageRadius / gameInfo.scale, drawableY - gameInfo.centerImageRadius / gameInfo.scale, gameInfo.centerImageRadius * 2 / gameInfo.scale, gameInfo.centerImageRadius * 2 / gameInfo.scale);
            context.restore();
        }

        static drawGrid() {
            let color = isEmpty(gameSettings.gridColor) ? "#000000" : gameSettings.gridColor;
            context.globalAlpha = 0.3;
            context.strokeStyle = color;
            context.lineWidth = 1;

            let dX = (gameInfo.centerX - canvas.width / 2) % 20;
            for (let x = 20 - dX; x < canvas.width; x += 20) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, canvas.height);
                context.stroke();
                context.closePath();
            }

            let dY = (gameInfo.centerY - canvas.height) % 20;
            for (let y = 20 - dY; y < canvas.height; y += 20) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(canvas.width, y);
                context.stroke();
                context.closePath();
            }

            context.globalAlpha = 1;

        }

    }


    class Food extends Arc {

        constructor(x, y, mass, color) {
            super();

            this.x = x;
            this.y = y;
            this.mass = mass;
            this.toMass = 0;
            this.color = color;
        }

        update() {
            rendersArr.push(this);
        }

    }

    class Bullet extends Arc {

        constructor(x, y, sin, cos, mass, distance, color = "#ff0400") {
            super();

            this.x = x;
            this.y = y;
            this.sin = sin;
            this.cos = cos;
            this.mass = mass;
            this.distance = distance;
            this.color = color;
        }

        update(delta = 1) {

            if (this.outOfBorder()) {
                if (this.x <= 0 || this.x >= gameInfo.width) {
                    this.cos = -this.cos;
                }
                if (this.y <= 0 || this.y >= gameInfo.height) {
                    this.sin = -this.sin;
                }
                this.distance /= 2;
            }

            if (this.distance > 0) {
                let speed = this.distance * delta / 23;
                if (speed < 1) speed = 1;
                if (this.distance < speed) speed = this.distance;

                this.x = roundFloor(this.x + speed * this.cos, 2);
                this.y = roundFloor(this.y + speed * this.sin, 2);

                if (this.x < 0) this.x = 0;
                else if (this.x > gameInfo.width) this.x = gameInfo.width;

                if (this.y < 0) this.y = 0;
                else if (this.y > gameInfo.height) this.y = gameInfo.height;

                this.distance = roundFloor(this.distance - speed, 2);
            }

            rendersArr.push(this);
        }

    }

    class Virus extends Arc {

        constructor(x, y, sin, cos, distance = 0, mass = 200, color = "#fff500") {
            super();

            this.x = x;
            this.y = y;
            this.sin = sin;
            this.cos = cos;
            this.distance = distance;
            this.mass = mass;
            this.toMass = 0;
            this.color = color;
        }

        update() {

            if (this.x <= 0 || this.x >= gameInfo.width) {
                this.cos = -this.cos;
            }
            if (this.y <= 0 || this.y >= gameInfo.height) {
                this.sin = -this.sin;
            }

            if (Math.abs(this.toMass) > 0) {
                let speed = this.toMass * this.timeRatio / 5;
                if (Math.abs(speed) < 1) speed = this.toMass >= 0 ? 1 : -1;
                if (Math.abs(this.toMass) < Math.abs(speed)) speed = this.toMass;

                this.mass = Math.round(this.mass + speed);
                this.toMass = Math.round(this.toMass - speed);

                if (this.mass > 400) {
                    this.mass = 400;
                    this.toMass = -200;
                    // virusArr.push(
                    //     new Virus(this.x, this.y, this.sin, this.cos, 200)
                    // )
                }
            }

            if (this.distance > 0) {
                let speed = this.distance * this.timeRatio / 20;
                if (speed < 1) speed = 1;
                if (this.distance < speed) speed = this.distance;

                this.x = roundFloor(this.x + speed * this.cos, 2);
                this.y = roundFloor(this.y + speed * this.sin, 2);

                if (this.x < 0) this.x = 0;
                else if (this.x > gameInfo.width) this.x = gameInfo.width;

                if (this.y < 0) this.y = 0;
                else if (this.y > gameInfo.height) this.y = gameInfo.height;

                this.distance = roundFloor(this.distance - speed, 2);
            }


            for (let i = 0; i < bulletsArr.length; i++) {
                let bullet = bulletsArr[i];

                let c = Math.sqrt((this.x - bullet.x) ** 2 + (this.y - bullet.y) ** 2);
                if (c > this.drawableRadius + bullet.drawableRadius + 3) continue;

                this.toMass += bullet.mass;
                bulletsArr.splice(i, 1);
                i--;

                this.sin = bullet.sin;
                this.cos = bullet.cos;
            }

            rendersArr.push(this);

        }

    }

    class Cell extends Arc {

        constructor(x, y, mass, sin, cos, main = false, color = "#000000", owner, id, spaceDistance = 0, isDraw = false) {
            super();

            this.x = x;
            this.y = y;
            this.mass = mass;
            this.sin = sin;
            this.cos = cos;
            this.main = main;
            this.owner = owner;
            this.color = color;
            this.id = id;
            this.toMass = 0;
            this.spaceSin = this.sin;
            this.spaceCos = this.cos;
            this.spaceDistance = spaceDistance;
            this.totalSpaceDistane = this.spaceDistance;
            this.engineDistance = 0;
            this.engineSin = 0;
            this.engineCos = 0;
            this.isConnect = false;
            this.isCollising = false;
            this.isDraw = isDraw;
            setTimeout(() => this.isConnect = true, 1000);

            this.updateDirection();
        }

        setColor(color) {
            this.color = color;
        }

        update(delta = 1) {
            this.updateDirection();
            let speed = Math.min(this.mouseDist, this.speed);
            if (this.spaceDistance === 0) {
                this.x = roundFloor(this.x + this.cos * speed * delta, 2);
                this.y = roundFloor(this.y + this.sin * speed * delta, 2);
            }

            if (Math.abs(this.toMass) > 0) {
                let speed = this.toMass * delta / 5;
                if (Math.abs(speed) < 1) speed = this.toMass >= 0 ? 1 : -1;
                if (Math.abs(this.toMass) < Math.abs(speed)) speed = this.toMass;

                this.mass = Math.round(this.mass + speed);
                this.toMass = Math.round(this.toMass - speed);
                // if (this.main && this.owner.current) {
                //     gameInfo.byScale += speed / 40000;
                // }
                if (this.mass >= 22500) {
                    this.mass = 22500;
                    this.toMass = 0;
                }
            }

            if (Math.abs(this.spaceDistance > 0)) {
                if (this.spaceDistance <= this.totalSpaceDistane / 1.3) this.isCollising = true;
                let speed = this.spaceDistance * delta / 15;
                if (Math.abs(speed) < 1) speed = this.spaceDistance >= 0 ? 1 : -1;
                // if (Math.abs(speed) > 10) speed = this.spaceDistance >= 0 ? 10 : -10;
                if (Math.abs(this.spaceDistance) < Math.abs(speed)) speed = this.spaceDistance;

                this.x = roundFloor(this.x + speed * this.spaceCos * this.speed, 2);
                this.y = roundFloor(this.y + speed * this.spaceSin * this.speed, 2);
                this.spaceDistance = roundFloor(this.spaceDistance - speed, 2);
            }

            if (Math.abs(this.engineDistance > 0)) {
                let speed = this.engineDistance * delta / 25;
                if (Math.abs(speed) < 1) speed = this.engineDistance >= 0 ? 1 : -1;
                // if (Math.abs(speed) > 30) speed = this.engineDistance >= 0 ? 30 : -30;
                if (Math.abs(this.engineDistance) < Math.abs(speed)) speed = this.engineDistance;

                this.x = roundFloor(this.x + speed * this.engineCos * this.speed, 2);
                this.y = roundFloor(this.y + speed * this.engineSin * this.speed, 2);
                this.engineDistance = roundFloor(this.engineDistance - speed, 2);
            }

            for (let i = 0; i < bulletsArr.length; i++) {
                let bullet = bulletsArr[i];
                let c = Math.sqrt((this.x - bullet.x) ** 2 + (this.y - bullet.y) ** 2);
                if (this.drawableRadius >= c) {
                    this.toMass += bullet.mass;
                    bulletsArr.splice(i, 1);
                    i--;
                }
            }

            for (let i = 0; i < virusArr.length; i++) {
                if (this.mass < 250) break;

                let virus = virusArr[i];

                let c = Math.sqrt((this.x - virus.x) ** 2 + (this.y - virus.y) ** 2);
                if (c > this.drawableRadius - 0.5 * virus.drawableRadius) continue;

                let count = Math.min(Math.floor((this.mass / 2) / 50), 64 - this.owner.cells.length);
                let mass = Math.floor((this.mass / 2) / count);
                let angleStep = 180 / count;
                let angle = getAngle(this.sin, this.cos);

                this.isCollising = true;

                let currentAngle = angle.degree - 90;

                while (count > 0) {
                    let sin = Math.sin(degreeToRadians(currentAngle));
                    let cos = Math.cos(degreeToRadians(currentAngle));

                    let distance = this.radius + mass / 10 + 5;
                    this.owner.cells.push(
                        new Cell(this.x + distance * cos, this.y + distance * sin, mass, sin, cos, false, this.color, this.owner, ++this.owner.cellId, 50, true)
                    );
                    currentAngle += angleStep;
                    count--;
                    // if (this.owner.current) gameInfo.byScale += 0.05;
                }

                this.toMass -= this.mass / 2;
                virusArr.splice(i, 1);
                i--;
            }

            for (let i = 0; i < foodsArr.length; i++) {
                let food = foodsArr[i];
                let c = Math.sqrt((this.x - food.x) ** 2 + (this.y - food.y) ** 2);
                if (c > this.drawableRadius + food.drawableRadius + 1) continue;

                this.toMass += food.mass;
                foodsArr.splice(i, 1);
                i--;
            }

            if (this.x < 0) this.x = 0;
            else if (this.x > gameInfo.width) this.x = gameInfo.width;

            if (this.y < 0) this.y = 0;
            else if (this.y > gameInfo.height) this.y = gameInfo.height;

            if (this.engineDistance <= 0) {
                this.engineSin = 0;
                this.engineCos = 0;
            }
            if (this.x <= 0 || this.x >= gameInfo.width) {
                this.engineCos = -this.cos;
                this.engineDistance = this.x <= 0 ? -this.x : this.x - gameInfo.width;
            }
            if (this.y <= 0 || this.y >= gameInfo.height) {
                this.engineSin = -this.sin;
                this.engineDistance = this.y <= 0 ? -this.y : this.y - gameInfo.height;
            }

            for (let p = 0; p < playersArr.length; p++) {

                for (let i = 0; i < playersArr[p].cells.length; i++) {

                    let cell = playersArr[p].cells[i];
                    if (cell.id === this.id && this.owner.id === playersArr[p].id) continue;

                    let distance = roundFloor(Math.sqrt((cell.x - this.x) ** 2 + (cell.y - this.y) ** 2), 2);
                    // if (this.mass < cell.mass) continue;
                    if (this.owner.id === playersArr[p].id) {
                        if (!cell.isCollising || !this.isCollising) continue;
                        let different = roundFloor(this.drawableRadius + cell.drawableRadius - distance, 2);

                        if (different > 0 && (!this.isConnect || !cell.isConnect)) {
                            let differentX = this.x - cell.x;
                            let differentY = this.y - cell.y;
                            let c = Math.sqrt(differentX ** 2 + differentY ** 2);

                            this.engineCos = differentX / c || 0;
                            this.engineSin = differentY / c || 0;

                            this.engineDistance = different;
                            // this.x = roundFloor(this.x + different * cos, 2);
                            // this.y = roundFloor(this.y + different * sin, 2)
                        }

                        if (Math.abs(this.spaceDistance) > 0 || this.mass < cell.mass || !this.isConnect || !cell.isConnect) continue;
                        if (distance <= roundFloor(this.drawableRadius - cell.drawableRadius / 2, 2)) {
                            this.toMass = roundFloor(this.toMass + cell.mass, 2);
                            this.main = cell.main || this.main;
                            playersArr[p].cells.splice(i, 1);
                            i--;

                            if (playersArr[p].updateI >= i) {
                                playersArr[p].updateI--;
                            }
                            // this.isConnect = false;
                            // setTimeout(() => this.isConnect = true, 100);
                        }
                        continue;
                    }

                    if (this.mass < 1.25 * cell.mass) continue;
                    if (distance > roundFloor(this.drawableRadius - cell.drawableRadius / 2, 2)) continue;
                    this.toMass = roundFloor(this.toMass + cell.mass, 2);
                    playersArr[p].cells.splice(i, 1);
                    i--;

                    if (playersArr[p].updateI >= i) {
                        playersArr[p].updateI--;
                    }
                    if (playersArr[p].cells.length === 0) continue;
                    if (cell.main) playersArr[p].cells[0].main = true;

                }
            }

            this.updateCenterDrawable();
            rendersArr.push(this);
        }

        updateDirection() {

            let differentX = this.owner.mouse.x - this.x;
            let differentY = this.owner.mouse.y - this.y;

            if (Math.abs(differentY) < 1) differentY = 0;
            if (Math.abs(differentX) < 1) differentX = 0;

            let c = Math.sqrt(differentX ** 2 + differentY ** 2);
            this.sin = roundFloor(differentY / c, 2) || -1;
            this.cos = roundFloor(differentX / c, 2) || 0;
        }

        updateCenterDrawable() {
            if (!this.owner.current) return true;

            if (!this.main) return true;

            let differentX = this.x - gameInfo.centerX;
            let differentY = this.y - gameInfo.centerY;
            // if(Math.abs(differentX) < 10) differentX = 0;
            // if(Math.abs(differentY) < 10) differentY = 0;
            let distance = Math.sqrt(differentX ** 2 + differentY ** 2);
            // if(distance < 10) return true;
            let sin = differentY / distance || 0;
            let cos = differentX / distance || 0;

            let speed = distance / 10;
            if (Math.abs(speed) < 1) speed = distance >= 0 ? 1 : -1;
            if (Math.abs(distance) < Math.abs(speed)) speed = distance;

            let height = speed * sin;
            let width = speed * cos;
            this.owner.mouse.x = roundFloor(this.owner.mouse.x + width * gameInfo.scale, 2);
            this.owner.mouse.y = roundFloor(this.owner.mouse.y + height * gameInfo.scale, 2);
            gameInfo.centerX = roundFloor(gameInfo.centerX + width, 2);
            gameInfo.centerY = roundFloor(gameInfo.centerY + height, 2);
        }


        split() {
            this.isCollising = true;
            let mass = this.mass + this.toMass;
            if (this.owner.cells.length === 64 || mass <= 250) return true;

            let speed = Math.min(this.mouseDist, this.speed);

            this.x = roundFloor(this.x - this.cos * speed, 2);
            this.y = roundFloor(this.y - this.sin * speed, 2);

            this.isConnect = false;
            setTimeout(() => this.isConnect = true, 1000);

            let height = this.radius * this.sin * 1.1;
            let width = this.radius * this.cos * 1.1;

            this.toMass = Math.floor(this.toMass - mass / 2);

            let distance = 50000 / mass + mass / 10;

            this.owner.cells.push(
                new Cell(roundFloor(this.x + width, 2), roundFloor(this.y + height, 2), mass / 2, this.sin, this.cos, false, this.color, this.owner, ++this.owner.cellId, distance)
            );

        }


        shoot() {
            if (this.mass + this.toMass < 250) return true;

            bulletsArr.push(
                new Bullet(this.x + (this.radius + 5) * this.cos, this.y + (this.radius + 5) * this.sin, this.sin, this.cos, 50, 100, this.color)
            );
            this.toMass -= 50;
        }

    }


    class Player {
        skinId = null;
        cellId = 0;
        ids = [];
        totalMass = 0;
        mass = 0;
        stickersSet = null;
        stickerI = null;
        lastDeletedTime = performance.now();
        isSplit = false;

        constructor(x, y, mass, color = "#000000", current = false, id, nick, skin = "", skinId = "") {
            this.skin = skin;
            this.skinId = skinId;

            this.mouse = {
                x: mouseCoords.x,
                y: mouseCoords.y
            };

            this.cells = [
                new Cell(x, y, mass, null, null, current, color, this, 0, 0, true)
            ];
            this.current = current;
            this.updateI = 0;
            this.id = id;
            this.nick = nick;
            this.color = color;

            this.loadImage();
        }

        setColor(color) {
            this.color = color;
            for (let i = 0; i < this.cells.length; i++) {
                this.cells[i].setColor(color);
            }
        }

        loadImage() {
            if (isEmpty(this.skin) || isEmpty(this.skinId)) return false;
            loadImage(this.skinId, this.skin);
        }

        setNick(nick, skin, skinId) {
            this.nick = nick;
            this.skin = skin;
            this.skinId = skinId;
            this.loadImage();
        }

        update(delta = 1) {
            this.updateI = 0;
            let mass = 0;
            for (; this.updateI < this.cells.length; this.updateI++) {
                this.cells[this.updateI].update(delta);
                try {
                    mass = (mass + this.cells[this.updateI].mass) || mass;
                } catch {
                }
                // rendersArr.push(this.cells[this.updateI]);
            }
            if (mass > this.totalMass) this.totalMass = mass;
            this.mass = mass;
        }


        split() {
            this.isSplit = true;
            let length = this.cells.length;
            for (let i = 0; i < length; i++) {
                this.cells[i].split();
            }

            this.isSplit = false;
        }

        shoot() {
            let length = this.cells.length;
            for (let i = 0; i < length; i++) {
                this.cells[i].shoot();
            }
        }

        mouseMove(x, y) {
            [this.mouse.x, this.mouse.y] = [x, y];
        }


        changePos(player) {
            if (!this.isSplit) {
                this.cellId = player.cellId;
            }
            let length = player.cells.length;
            this.ids = [];
            for (let i = 0; i < length; i++) {
                let cell = this.findCell(player.cells[i].id);
                let pCell = player.cells[i];
                this.ids.push(+pCell.id);
                if (!cell) {
                    if (this.isSplit) continue;
                    console.log("cell");
                    let c = new Cell(pCell.x, pCell.y, pCell.mass, pCell.sin, pCell.cos, pCell.main, pCell.color, this, pCell.id, pCell.spaceDistance, true);
                    c.spaceSin = pCell.spaceSin;
                    c.spaceCos = pCell.spaceCos;
                    c.engineSin = pCell.engineSin;
                    c.engineCos = pCell.engineCos;
                    c.engineDistance = pCell.engineDistance;
                    c.toMass = pCell.toMass;
                    c.totalSpaceDistane = pCell.totalSpaceDistane;
                    c.isConnect = true;
                    c.isCollising = pCell.isCollising;
                    this.cells.push(c);
                    continue;
                }

                if (Math.abs(cell.spaceDistance) > 0) continue;
                try {
                    // if (Math.abs(this.cells[i].engineDistance) > 0) continue;
                    // this.cells[cell.count].x = player.cells[i].x;
                    // this.cells[cell.count].y = player.cells[i].y;
                    // this.cells[cell.count].mass = player.cells[i].mass;
                    // continue;
                    // this.cells[i].toMass = player.cells[i].toMass;
                    let dX = pCell.x - this.cells[cell.count].x;
                    let dY = pCell.y - this.cells[cell.count].y;
                    let c = Math.sqrt(dX ** 2 + dY ** 2);
                    // if(c < 10) continue;
                    let sin = dY / c;
                    let cos = dX / c;
                    if (this.cells[cell.count].toMass >= 0) {
                        this.cells[cell.count].toMass = pCell.toMass + pCell.mass - this.cells[cell.count].mass;
                    }
                    // this.cells[cell.count].mass = pCell.mass;

                    // this.cells[cell.count].x = pCell.x;
                    // this.cells[cell.count].y = pCell.y;

                    this.cells[cell.count].engineCos = cos;
                    this.cells[cell.count].engineSin = sin;
                    this.cells[cell.count].engineDistance = c;
                    this.cells[cell.count].isCollising = pCell.isCollising;
                    this.cells[cell.count].main = pCell.main;
                } catch (e) {
                }

            }
            this.deleteCells();
        }

        deleteCells() {
            if (performance.now() - this.lastDeletedTime < 10000 || this.isSplit) return true;
            this.lastDeletedTime = performance.now();
            for (let i = 0; i < this.cells.length; i++) {
                if (this.ids.includes(this.cells[i].id)) continue;

                this.cells.splice(i, 1);
                i--;
            }
        }

        /**
         * @param id Number
         * @return Object | null
         */
        findCell(id) {
            let length = this.cells.length;
            let cell = null;
            let i = 0;
            for (; i < length; i++) {
                if (+this.cells[i].id === +id) {
                    cell = this.cells[i];
                    break;
                }
            }
            if (!cell) return null;

            return {cell, count: i};
        }

        loadStickers(stickers) {
            this.stickersSet = stickers;
            for (let i = 0; i < this.stickersSet.length; i++) {
                loadImage(this.stickersSet[i].image_id, this.stickersSet[i].src);
            }

        }

    }

    ///////////////////


    let canvas = document.getElementById("canvas");
    canvas.style.letterSpacing = "2px";
    let context = canvas.getContext("2d");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();

    window.addEventListener("resize", resize);

    ///////////////
    let mouseCoords = {
        x: 0,
        y: 0
    };

    $("body")[0].addEventListener("mousemove", event => {
        mouseCoords.x = gameInfo.centerX - canvas.width * gameInfo.scale / 2 + event.clientX * gameInfo.scale;
        mouseCoords.y = gameInfo.centerY - canvas.height * gameInfo.scale / 2 + event.clientY * gameInfo.scale;

        // if (playersArr.length > 0) {
        //     playersArr[0].mouse.x = mouseCoords.x;
        //     playersArr[0].mouse.y = mouseCoords.y;
        // }
        if (!ws) return true;

        ws.sendJson({
            action: "mouse_move",
            x: mouseCoords.x,
            y: mouseCoords.y
        });
        if (playersArr.length > 0 && playersArr[0].current) {
            playersArr[0].mouseMove(mouseCoords.x, mouseCoords.y);
        }

    });
    ///////////////


    let gameInfo = {
        centerImageRadius: 100,
        centerX: 0,
        centerY: 0,
        width: 1000,
        height: 1000,
        startMass: 500,
        scale: 1,
        byScale: 0,
        cellScale: 0,
        updateTime: 0,
        deltaTime: 0,
        perSecond: 1000 / 60,
        food: 500,
        foodMinMass: 50,
        foodMaxMass: 100,
        virus: 10
    };


    // loadImage("virus", "/src/images/virus_arrow.png");
    loadImage("virus_arrow", "/src/images/virus_arrow1.png");
    loadImage("center", "/src/images/logo.png");
    loadImage("food", "/src/images/star.png");
    // loadImage("virus", "https://avatars.mds.yandex.net/get-pdb/939186/3e8700ba-511c-45e1-b9fb-dc3f02e88ca4/s1200");


    let rendersArr = [];
    let bulletsArr = [];
    let virusArr = [];
    let foodsArr = [];
    let playersArr = [];

    let renderVar = null;

    function calcScaleByCell() {
        if (!playersArr[0].current) return null;

        return 0.01 * (playersArr[0].cells.length - 1);
    }

    function render() {
        // return true;
        new Promise(() => {
            // let time = performance.now();
            while (performance.now() - gameInfo.updateTime >= gameInfo.perSecond) {
                gameInfo.deltaTime = performance.now() - gameInfo.updateTime;
                gameInfo.updateTime = performance.now();

                context.clearRect(0, 0, canvas.width, canvas.height);
                let backgroundColor = (gameSettings.isBackground && !isEmpty(gameSettings.background)) ? gameSettings.background : "#000000";
                context.fillStyle = backgroundColor;
                context.fillRect(0, 0, canvas.width, canvas.height);

                let cellScale = calcScaleByCell();
                if (!isEmpty(cellScale)) {
                    gameInfo.byScale += cellScale - gameInfo.cellScale;
                    gameInfo.cellScale = cellScale;
                }

                if (Math.abs(gameInfo.byScale) > 0) {
                    let speed = gameInfo.byScale * (gameInfo.deltaTime / gameInfo.perSecond) / 30;
                    if (Math.abs(speed) < 0.01) speed = gameInfo.byScale > 0 ? 0.01 : -0.01;
                    if (Math.abs(gameInfo.byScale) < Math.abs(speed)) speed = gameInfo.byScale;

                    gameInfo.scale += speed;
                    gameInfo.byScale -= speed;
                }

                rendersArr = [];

                for (let i = 0; i < playersArr.length; i++) {
                    playersArr[i].update(getTimeByDelta(gameInfo.deltaTime));
                }

                for (let i = 0; i < bulletsArr.length; i++) {
                    bulletsArr[i].update(getTimeByDelta(gameInfo.deltaTime));
                }

                for (let i = 0; i < virusArr.length; i++) {
                    virusArr[i].update();
                }

                for (let i = 0; i < foodsArr.length; i++) {
                    foodsArr[i].update();
                }

                if (gameSettings.isGrid) {
                    Arc.drawGrid();
                }
                Arc.drawCenter();

                // let time = performance.now();
                let renderLength = rendersArr.length;
                // rendersArr = rendersArr.sort((a, b) => a.drawableRadius - b.drawableRadius);
                for (let i = 0; i < renderLength; i += 2) {
                    rendersArr[i].render();
                    try {
                        rendersArr[i + 1].render();
                    } catch (e) {
                    }

                }

                // Arc.drawCompass();

                // console.log(performance.now() - time);
            }
            renderVar = requestAnimationFrame(render);
        });


    }


    let coordsHtml = $("#coords");

    function updateHtml() {
        coordsHtml.text("Mass: " + playersArr[0].mass + " X: " + Math.floor(gameInfo.centerX * 10) + " Y: " + Math.floor(gameInfo.centerY * 10));
        requestAnimationFrame(updateHtml);
    }


    function getUnit(unit) {
        let returned = null;
        if (unit.name === "player") {
            let current = unit.current === "true";
            let player = new Player(0, 0, 0, unit.color, current, unit.id, unit.nick, "", "");
            player.mouse.x = unit.mouseX;
            player.mouse.y = unit.mouseY;
            player.skin = unit.skin;
            player.skinId = unit.skinId;
            player.stickersSet = unit.stickersSet || null;
            player.stickerI = isEmpty(unit.stickerI) ? null : unit.stickerI;
            player.cellId = unit.cellId;

            let length = unit.cells.length;
            let arr = [];
            for (let i = 0; i < length; i++) {

                let cell = unit.cells[i];
                let c = new Cell(cell.x, cell.y, cell.mass, 0, 0, cell.main, cell.color, player, cell.id, 0);
                c.engineSin = cell.engineSin;
                c.engineCos = cell.engineCos;
                c.engineDistance = cell.engineDistance;
                c.spaceCos = cell.spaceCos;
                c.spaceSin = cell.spaceSin;
                c.spaceDistance = cell.spaceDistance;
                c.totalSpaceDistane = cell.totalSpaceDistane;
                c.toMass = cell.toMass;
                c.isConnect = cell.isConnect;
                c.isCollising = cell.isCollising;
                c.updateDirection();
                arr.push(c);

            }
            player.cells = arr;
            returned = player;

        } else if (unit.name === "food") {
            let food = new Food(unit.x, unit.y, unit.mass, unit.color);
            food.toMass = unit.toMass;
            food.id = unit.id;

            returned = food;

        } else if (unit.name === "bullet") {
            let bullet = new Bullet(unit.x, unit.y, unit.sin, unit.cos, unit.mass, unit.distance, unit.color);
            bullet.toMass = unit.toMass;
            bullet.id = unit.id;

            returned = bullet;

        } else if (unit.name === "virus") {
            let virus = new Virus(unit.x, unit.y, unit.sin, unit.cos, unit.distance, unit.mass, unit.color);
            virus.toMass = unit.toMass;
            virus.id = unit.id;

            returned = virus;
        }

        return returned;
    }

    function addUnit(unit, delta = 1) {
        let name = unit.constructor.name.toLowerCase();
        if (name === "player") {
            if (playersArr.length > 0 && +playersArr[0].id === unit.id) return true;

            unit.loadImage();
            if (unit.current) {
                if (playersArr.length > 0 && playersArr[0].current) return true;
                playersArr.unshift(unit);
                gameInfo.updateTime = performance.now();
                playersArr[0].update(delta);
                render();
                updateHtml();
                getTopPlayers();
                ws.sendJson({action: "get_all_units"});
                setTimeout(function () {
                    ws.sendJson({
                        action: "mouse_move",
                        x: playersArr[0].mouse.x,
                        y: playersArr[0].mouse.y
                    });
                }, 1000);
                return true;
            }
            playersArr.push(unit);

            return true;
        }
        if (name === "food") {
            foodsArr.push(unit);
            return true;
        }
        if (name === "bullet") {
            // unit.update(delta);
            bulletsArr.push(unit);
            return true;
        }
        if (name === "virus") {
            virusArr.push(unit);
            return true;
        }

    }


    function getTopPlayers() {
        let arr = playersArr.sort((a, b) => b.mass - a.mass);
        let html = "";
        for (let [key, player] of Object.entries(arr)) {
            if (key >= 10) break;
            html += "<div class='flex_row'><span class='number'>" + (+key + 1) + "</span><span class='nick'>" + player.nick + "</span><span class='mass'>" + Math.floor(player.mass) + "</span></div>";
        }
        $("#top_players").html(html);
        setTimeout(getTopPlayers, 2000);
    }

    function destroyUnit(type, id) {
        let arr = [];
        if (type === "virus") arr = virusArr;
        else if (type === "food") arr = foodsArr;
        else if (type === "bullet") arr = bulletsArr;

        for (let i = 0; i < arr.length; i++) {
            if (+arr[i].id === +id) {
                arr.splice(i, 1);
                break;
            }
        }

    }

    /**
     * @param id Number
     * @returns Player | null
     */
    function findPlayer(id) {
        let length = playersArr.length;
        let player = null;
        for (let i = 0; i < length; i++) {
            if (+playersArr[i].id !== +id) continue;
            player = playersArr[i];
            break;
        }

        return player;
    }

    function showOnline() {
        $("#online_players > div").empty();
        for (let i = 0; i < playersArr.length; i++) {
            let player = playersArr[i];
            let html = "<div class='player_online' data-pid='" + player.id + "' data-nick='" + player.nick + "' style='color: " + player.color + "'>" + player.nick + "</div>";
            $("#online_players > div").append(html);
        }
        $("#online_players .total_players").text(playersArr.length);
        $("#online_players").removeClass("closed");
    }


    function sendChatMessage() {
        if (!ws) return false;

        let input = $("#message_text");
        let message = input.val();
        message = message.trim();
        if (!message) return false;

        if (message[0] === "/") {
            new Command(message.substr(1));
            input.val("");
            $("#chat_service").addClass("closed");
            $("#pm_id").val("");
            return true;
        }

        let pmId = $("#pm_id").val();
        let pm = Number(pmId !== "");
        ws.sendJson({action: "chat_message", message, pm, pmId});
        input.val("");
        $("#chat_service").addClass("closed");
        $("#pm_id").val("");
    }

    $("#message_text")[0].addEventListener("keypress", function (event) {
        event.stopPropagation();
        if (event.code.toLowerCase() !== "enter") return true;
        event.preventDefault();
        sendChatMessage();
    });


    function clearFood() {
        for (let i = 0; i < foodsArr.length; i++) {
            foodsArr[i].clear();
        }
    }

    let lastKeyPressTime = {};

    let preventDefault = ["tab"];
    let keyPressed = [];
    let isSticker = false;
    window.addEventListener("keydown", function (event) {
        let code = event.code.toLowerCase();
        if (code in lastKeyPressTime) {
            if (performance.now() - lastKeyPressTime[code] < 100) return true;
        }
        lastKeyPressTime[code] = performance.now();

        if (preventDefault.includes(code)) event.preventDefault();
        if (keyPressed.includes(code)) return true;
        keyPressed.push(code);
        if (code === "tab") {
            if (!ws) return true;
            showOnline();
            return true;
        }

        if (code === "keyc") {
            $("#game_settings").toggleClass("closed");
            return true;
        }

        if (code === "keyg") {
            $("#user_nicks").toggleClass("closed");
            return true;
        }

        if (code === "keyr") {
            clearFood();
            return true;
        }

        if (code === "keyw") {
            if (typeof ws !== "undefined") {
                ws.sendJson({action: "player_shoot"});
            }
            // playersArr[0].shoot();
            return true;
        }

        if (code === "space") {
            if (typeof ws !== "undefined") {
                ws.sendJson({
                    action: "player_split"
                });
            }
            playersArr[0].split();
            return true;
        }


        if (["digit1", "digit2", "digit3", "digit4", "digit5", "digit6", "digit7", "digit8", "digit9"].includes(code)) {
            if (isSticker || !ws) return true;

            isSticker = true;
            let stickerNumber = +code.substr(-1) - 1;
            playersArr[0].stickerI = stickerNumber;

            ws.sendJson({
                action: "select_sticker",
                number: stickerNumber
            });
            return true;
        }
    });
    window.addEventListener("keyup", function (event) {
        let code = event.code.toLowerCase();
        let i = keyPressed.indexOf(code);
        if (i < 0) return true;
        keyPressed.splice(i, 1);
        if (code === "tab") {
            $("#online_players").addClass("closed");
            return true;
        }
        if (["digit1", "digit2", "digit3", "digit4", "digit5", "digit6", "digit7", "digit8", "digit9"].includes(code)) {
            isSticker = false;
            if (!ws) return true;

            playersArr[0].stickerI = null;
            ws.sendJson({
                action: "select_sticker",
                number: ""
            });
            return true;
        }

        if (code === "escape") {
            if (!ws) return true;
            $("#main_menu").toggleClass("closed");
            return true;
        }

    });

    document.getElementById("into_game_button").addEventListener("click", function () {

        let selected = $(".server.selected");
        if (selected.length !== 1) return true;

        let ip = selected.attr("data-ip");
        $("#main_menu").addClass("closed");
        if (ws && ws.address === "ws://" + ip) {
            changeNick($("#nick_for_game").val().trim(), $("#password_for_game").val().trim());
            changeColor($("#select_color").val());
            return true;
        }
        startGame(ip);
    });


    {
        let wheel = 0;
        window.addEventListener("wheel", function (event) {
            let byScale = event.deltaY > 0 ? 0.1 : -0.1;
            if (Math.abs(wheel + byScale) > 0.5) return true;

            wheel += byScale;
            gameInfo.byScale += byScale;
        });
        document.getElementById("game_settings").addEventListener("wheel", event => event.stopPropagation());
    }

    function clearAll() {
        try {
            cancelAnimationFrame(renderVar);
        } catch {
        }
        [playersArr, virusArr, foodsArr, bulletsArr, rendersArr] = [[], [], [], [], []];
    }

    function findVirus(id) {
        id = +id;
        let count = 0;
        let virus = null;
        for (let i = 0; i < virusArr.length; i++) {
            if (+virusArr[i].id === id) {
                virus = virusArr[i];
                count = i;
                break;
            }
        }

        if (!virus) return null;
        return {virus, count};
    }


    let ping = $("#ping");

    function startGame(ip) {
        isGame = false;
        clearAll();
        try {
            ws.close();
        } catch {
        }
        ws = null;
        ws = new Ws("ws://" + ip);

        ws.on("open", function () {
            ws.sendJson({
                action: "player_connect",
                nick: $("#nick_for_game").val().trim().substr(0, 15) || "SandL",
                password: $("#password_for_game").val().trim(),
                color: $("#select_color").val(),
                token: getCookie("Token") || "",
                userId: getCookie("User-Id") || ""
            });

        });
        ws.on("message", function (event) {
            let data = arrayBufferToString(event.data);
            try {
                data = JSON.parse(data);
                if (typeof (data) !== "object") throw("Error");
            } catch {
                return true;
            }

            if (data.action === "load_game_settings") {
                gameInfo.width = data.settings.width;
                gameInfo.height = data.settings.height;
            }

            if (data.action === "spawn_unit") {
                delete data.action;
                let unit = getUnit(data);
                addUnit(unit, getTimeByDelta(Date.now() - data.time));

                return true;
            }

            if (data.action === "get_all_units") {
                let arr = [...data.units.players, ...data.units.foods, ...data.units.virus, ...data.units.bullets];
                let length = arr.length;

                for (let i = 0; i < length; i++) {
                    let unit = getUnit(arr[i]);
                    addUnit(unit);
                }
                isGame = true;
                setTimeout(function () {
                    ws.sendJson({action: "update_units"});
                }, 0);
                return true;
            }

            if (data.action === "player_disconnect") {
                let length = playersArr.length;

                for (let i = 0; i < length; i++) {
                    if (+playersArr[i].id !== +data.id) continue;
                    playersArr.splice(i, 1);
                    break;
                }

                return true;
            }

            if (data.action === "update_units") {
                if (!isGame) return true;
                delete data.action;

                let length = data.units.players.length;
                for (let i = 0; i < length; i++) {
                    let unit = getUnit(data.units.players[i]);
                    // if (name === "player") {
                    if (playersArr.length > 0 && +unit.id === playersArr[0].id) {
                        // unit.current = true;
                        // pArr.unshift(unit);
                        // pArr[0].update(getTimeByDelta(Date.now() - data.time));
                        // console.log(unit.cells[0].x + " " + playersArr[0].cells[0].x);
                        // continue;
                    }
                    // unit.update(getTimeByDelta(Date.now() - data.time));
                    let player = findPlayer(unit.id);
                    if (player !== null) {
                        player.changePos(unit);
                    }
                    // pArr.push(unit);
                    // let player = findPlayer(unit.id);
                    // let delta = getTimeByDelta(Date.now() - data.time);
                    // player.updateByDelta(unit.cells, delta);
                    // continue;
                    // }
                    // if (name === "food") {
                    //     fArr.push(unit);
                    //     continue;
                    // }
                    // if (name === "virus") {
                    //     vArr.push(unit);
                    //     continue;
                    // }
                    // if (name === "bullet") {
                    //     bArr.push(unit);
                    //     continue;
                    // }
                }
                length = data.units.virus.length;
                for (let i = 0; i < length; i++) {
                    let pVirus = getUnit(data.units.virus[i]);

                    let virus = findVirus(pVirus.id);
                    if (!virus) {
                        let v = new Virus(pVirus.x, pVirus.y, pVirus.sin, pVirus.cos, pVirus.distance, pVirus.mass);
                        v.toMass = pVirus.toMass;
                        virusArr.push(v);
                        continue;
                    }

                    if (virus.virus.distance <= 0) {
                        let dX = pVirus.x - virus.virus.x;
                        let dY = pVirus.y - virus.virus.y;
                        let c = Math.sqrt(dX ** 2 + dY ** 2);
                        let sin = dY / c;
                        let cos = dX / c;
                        virusArr[virus.count].sin = sin;
                        virusArr[virus.count].cos = cos;
                        virusArr[virus.count].distance = c;
                    }

                    virusArr[virus.count].toMass = pVirus.toMass + pVirus.mass - virusArr[virus.count].mass;
                }


                // cancelAnimationFrame(renderVar);
                // playersArr = pArr;
                // virusArr = vArr;
                // bulletsArr = bArr;
                // foodsArr = fArr;
                // gameInfo.updateTime -= Date.now() - data.time;
                // renderVar = requestAnimationFrame(render);
                setTimeout(function () {
                    ws.sendJson({action: "update_units"});
                }, 0);

                return true;
            }

            // if (data.action === "player_split") {
            //     let player = findPlayer(data.id);
            //     if (!player) return true;
            //     //
            //     player.split();
            //     // playersArr[0].split(1);
            //     return true;
            // }

            if (data.action === "mouse_move") {
                let player = findPlayer(data.id);
                if (!player) return true;

                player.mouseMove(data.x, data.y);
                return true;
            }

            if (data.action === "chat_message") {
                Message.getNewMessage(data);
                return true;
            }

            if (data.action === "ping") {
                let delta = Date.now() - data.time;
                ping.text(delta);

                return true;
            }

            if (data.action === "nick_info") {
                return true;
            }

            if (data.action === "game_message") {
                Message.gameMessage(data.message);
                return true;
            }

            if (data.action === "secondary_message") {
                Message.smallMessage(data.message);
                return true;
            }

            if (data.action === "select_sticker_set") {
                let player = findPlayer(data.id);
                if (!player) return true;

                player.loadStickers(data.stickers);
                return true;
            }

            if (data.action === "change_nick") {
                let player = findPlayer(data.id);
                if (!player) return true;

                player.setNick(data.nick, data.skin, data.skinId);

                return true;
            }

            if (data.action === "select_sticker") {
                let player = findPlayer(data.id);
                if (!player) return true;

                if (isEmpty(data.number)) data.number = null;
                player.stickerI = data.number;

                return true;
            }

            if (data.action === "change_color") {
                let player = findPlayer(data.id);
                if (!player) return true;

                player.setColor(data.color);

                return true;
            }

            if (data.action === "destroy_unit") {
                destroyUnit(data.type, data.id);
                return true;
            }

        });
    }

})();