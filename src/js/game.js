(function () {
    let gameInfo = {
        centerImageRadius: 100,
        centerX: 0,
        centerY: 0,
        byCenterX: 0,
        byCenterY: 0,
        width: 1000,
        height: 1000,
        scale: 1,
        byScale: 0,
        cellScale: 0,
        updateTime: 0,
        deltaTime: 0,
        perSecond: 1000 / 60,
        lastStateTime: 0,
        differentStateTime: 1,
        lastStateTimeLocal: 0
    };
    let dailyTop = {
        nick: "",
        skin: "",
        score: "",
        skinId: ""
    };
    let isSpectate = false;


    function roundFloor(number, count = 2) {
        return Math.round(number * (10 ** count)) / (10 ** count);
    }

    function getAngle(sin, cos) {
        let angle = Math.asin(sin);
        if (angle > Math.PI) angle = -(2 * Math.PI - angle);
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
        if (delta <= 0) return 1;
        return delta / gameInfo.perSecond;
    }

///////////////
    class GameStates {
        constructor() {
            this.states = [];
            this.commands = [];
        }

        addGameCommand(command) {
            this.commands.push(command);
        }

        executeCommands(time) {
            for (let i = 0; i < this.commands.length; i++) {
                if (this.commands[i].time > time) break;

                let command = this.commands[i];
                if (command.command === "destroy_unit") {
                    game.destroyUnit(command.type, command.id);
                } else if (command.command === "spawn_unit") {
                    game.addUnit(command.unit, 1);
                }

                this.commands.splice(i, 1);
                i--;
            }

        }

        addGameState(state) {
            this.states.push(state);
        }

        getFirstState() {
            if (this.states.length === 0) return null;
            return this.states[0];
        }

        getGameState(time) {
            if (this.states.length === 0) return null;
            return this.states[0];
            for (let i = 0; i < this.states.length; i++) {
                if (time <= this.states[i].time) return this.states[i];
            }

            return null;
        }

        getStateByTime(time) {
            for (let i = 0; i < this.states.length; i++) {
                if (time <= this.states[i].time) {
                    return this.states[i];
                }
            }

            return null;
        }

        removeBeforeState(time) {

            for (let i = 0; i < this.states.length; i++) {
                if (time < this.states[i].time) break;
                this.states.splice(i, 1);
                i--;
            }

        }

        removeFirstState() {
            this.states.splice(0, 1);
        }

    }


    class Canvas {
        /**
         *
         * @type {HTMLCanvasElement}
         */
        canvas = document.getElementById("canvas");
        context = this.canvas.getContext("2d");

        constructor() {
            this.setResizeListener();
            this.setCanvasSettings();
        }

        toDataUrl() {
            return this.canvas.toDataURL("image/png", 1.0);
        }

        setCanvasSettings() {
            this.canvas.style.letterSpacing = "2px";
        }


        getMapCoords(x, y) {
            x = gameInfo.centerX - this.canvas.width * gameInfo.scale / 2 + x * gameInfo.scale;
            y = gameInfo.centerY - this.canvas.height * gameInfo.scale / 2 + y * gameInfo.scale;
            return {x, y};
        }

        getDrawable(unit) {
            return {
                x: this.canvas.width / 2 + (unit.x - gameInfo.centerX) / gameInfo.scale,
                y: this.canvas.height / 2 + (unit.y - gameInfo.centerY) / gameInfo.scale
            }
        }

        checkInCanvas(unit) {
            let drawable = this.getDrawable(unit);
            return !(drawable.x < 0 || drawable.x > this.canvas.width || drawable.y < 0 || drawable.y > this.canvas.height);
        }

        render(unit) {
            if (!unit.isShow) return true;
            let name = unit.constructor.name.toLowerCase();
            if (name === "food" && gameSettings.isHideFood) return true;

            let drawableX = this.canvas.width / 2 + (unit.x - gameInfo.centerX) / gameInfo.scale;
            let drawableY = this.canvas.height / 2 + (unit.y - gameInfo.centerY) / gameInfo.scale;

            if (drawableX < 0 || drawableX > this.canvas.width || drawableY < 0 || drawableY > this.canvas.height) return true;


            let color = unit.color;
            if (name === "cell" && gameSettings.isDisableColorAnim) {
                color = unit.owner.selectedColor;
            }
            let shadowColor = "#000000";

            if (name === "cell" && gameSettings.isCellColor) {
                color = gameSettings.cellColor || "#000000";

            } else if (name === "food" && gameSettings.isFoodColor) {
                color = gameSettings.foodColor || "#000000";

            } else if (name === "virus" && gameSettings.isVirusColor) {
                color = gameSettings.virusColor || "#000000";

            } else if (name === "bullet" && !unit.isDecreaseMass && gameSettings.isBulletColor) {
                color = gameSettings.bulletColor || "#000000";
            } else if (name === "bullet" && unit.isDecreaseMass && gameSettings.isDecreaseBulletColor) {
                color = gameSettings.decreaseBulletColor || "#000000";
            }


            // let textColor = rgb.brightness ? "#000000" : "#FFFFFF";
            // let strokeTextColor = rgb.brightness ? "#FFFFFF" : "#000000";

            let textColor = "#FFFFFF";
            let textCellColor = "#FFFFFF";
            if (gameSettings.isCellNickColor && gameSettings.cellNickColor) textCellColor = gameSettings.cellNickColor;
            let strokeTextColor = "#000000";


            this.context.save();

            if (gameSettings.isShadowColor) {
                shadowColor = gameSettings.shadowColor || "#000000";
                this.setShadow(shadowColor);
            }

            let radius = unit.drawableRadius / gameInfo.scale;
            if (gameSettings.isDrawCellBorder) {
                this.strokeArc(drawableX, drawableY, radius, toChangeColor(color), 6);
                this.context.restore();
            }

            let transparent = false;
            if (!gameSettings.isDisableTransparentSkin) {
                if (name === "virus" && unit.isFeeding && imagesArr['feeding_virus']) transparent = true;
                else if (name === "enemy" && imagesArr['enemy']) transparent = true;
            }


            if (name !== "cell") {
                this.drawArc(drawableX, drawableY, radius, color, transparent);
                this.context.restore();
            }

            let isDrawText = ((gameSettings.isOptimization && radius > 40) || (!gameSettings.isOptimization && radius > 25));

            if (name === "cell") {
                let stickerI = unit.owner.stickerI;
                let stickerSet = unit.owner.stickersSet;

                if (unit.owner.isTransparentSkin && gameSettings.isDrawBorderInvisible && !gameSettings.isDrawCellBorder) {
                    this.strokeArc(drawableX, drawableY, radius, toChangeColor(color), 6);
                    this.context.restore();
                }

                if (stickerI !== null && stickerI >= 0 && stickerSet && imagesArr[stickerSet[stickerI].image_id] && !gameSettings.hideStickers) {

                    this.drawArc(drawableX, drawableY, radius, color, transparent);
                    this.context.restore();

                    this.drawImage(imagesArr[stickerSet[stickerI].image_id], drawableX, drawableY, radius);
                } else if (imagesArr[unit.owner.skinId] && !gameSettings.hideSkins) {
                    if (unit.owner.isTransparentSkin && !gameSettings.isDisableTransparentSkin) transparent = true;
                    this.drawArc(drawableX, drawableY, radius, color, transparent);
                    this.context.restore();

                    if (unit.owner.isTurningSkin && !gameSettings.isDisableTurningSkin) {
                        this.drawImageByAngle(imagesArr[unit.owner.skinId], drawableX, drawableY, unit.mouseAngle + 90, radius);
                    } else this.drawImage(imagesArr[unit.owner.skinId], drawableX, drawableY, radius);
                } else {
                    this.drawArc(drawableX, drawableY, radius, color, false);
                    this.context.restore();
                }

                if (!gameSettings.isHideNick && isDrawText) {
                    if (!unit.owner.isInvisibleNick || gameSettings.isShowInvisibleNick) {
                        if (unit.owner.nickImage) {
                            this.drawImage(unit.owner.nickImage, drawableX, drawableY, radius);
                        }
                        // if (!isEmpty(unit.owner.clan)) {
                        //     let clanColor = textCellColor;
                        //     if (gameSettings.isClanCellColor && gameSettings.clanCellColor) clanColor = gameSettings.clanCellColor;
                        //     let r = unit.drawableRadius / (3.5 * gameInfo.scale);
                        //     let size = this.getTextSize(r, unit.owner.clan + unit.owner.nick);
                        //     let clanSize = this.getTextSize(r, unit.owner.clan);
                        //     let nickSize = this.getTextSize(r, unit.owner.nick);
                        //     this.drawText(drawableX - size / 2 + clanSize / 2, drawableY, r, unit.owner.clan, clanColor, true, "#000000");
                        //     this.drawText(drawableX + size / 2 - nickSize / 2, drawableY, r, unit.owner.nick, textCellColor, true, strokeTextColor);
                        //
                        // } else if (unit.owner.nickImage) {
                        //     this.drawImage(unit.owner.nickImage, drawableX, drawableY, radius);
                        //     // this.drawText(drawableX, drawableY, unit.drawableRadius / (3.5 * gameInfo.scale), unit.owner.clan + " " + unit.owner.nick, textCellColor, true, strokeTextColor);
                        // }
                    }
                }

                if (unit.owner.message && unit.main && gameSettings.isShowMessage) {
                    let color = gameSettings.textShowMessage || "#000000";
                    this.drawText(drawableX, drawableY - unit.drawableRadius / gameInfo.scale - 20, 25, unit.owner.message, color);
                }

                drawableY += unit.drawableRadius / (2 * gameInfo.scale);
                if (gameSettings.isCellMass && isDrawText) {
                    if (gameSettings.isCellMassColor) textColor = gameSettings.cellMassColor || "#FFFFFF";
                    this.drawText(drawableX, drawableY, unit.drawableRadius / (5 * gameInfo.scale), Math.floor(unit.mass), textColor);
                }


                return true;
            }

            if (name === "virus") {
                if (!unit.isFeeding && imagesArr['virus_arrow']) {
                    let q = (unit.mass - 200) / 200;
                    this.drawImageByAngle(imagesArr['virus_arrow'], drawableX, drawableY, -225 + 270 * q, unit.drawableRadius / gameInfo.scale);
                } else if (unit.isFeeding && imagesArr['feeding_virus']) {
                    this.drawImage(imagesArr['feeding_virus'], drawableX, drawableY, radius);
                }
                if (gameSettings.isVirusMass) {
                    let virusMassColor = "#FFFFFF";
                    if (gameSettings.isVirusMassColor && gameSettings.virusMassColor) virusMassColor = gameSettings.virusMassColor;
                    this.drawText(drawableX, drawableY, unit.drawableRadius / (2 * gameInfo.scale), Math.floor(unit.mass), virusMassColor);
                }
                return true;
            }


            if (name === "blackhole") {
                if (imagesArr['black_hole']) {
                    this.drawImage(imagesArr['black_hole'], drawableX, drawableY, radius);
                }
                return true;
            }

            if (name === "enemy") {
                if (imagesArr['enemy']) {
                    this.drawImage(imagesArr['enemy'], drawableX, drawableY, radius);
                }
                return true;
            }
            // if (name === "food" && imagesArr['food']) {
            //     this.drawImage(imagesArr['food'], drawableX, drawableY, radius * 2);
            // }

            if ((name === "food" || name === "bullet") && gameSettings.isAllMass) {
                this.drawText(drawableX, drawableY, unit.drawableRadius / (1.5 * gameInfo.scale), Math.floor(unit.mass), textColor);
            }
        }

        setShadow(color, blur = 10, x = 0, y = 0) {
            this.context.shadowColor = color;
            this.context.shadowBlur = blur;
            this.context.shadowOffsetX = x;
            this.context.shadowOffsetY = y;
        }

        drawArc(x, y, radius, color, transparent = false) {
            this.context.beginPath();
            this.context.fillStyle = color;
            if (transparent) this.context.globalAlpha = 0;
            this.context.arc(x, y, radius, 0, 2 * Math.PI, false);
            this.context.fill();
            this.context.closePath();
            this.context.globalAlpha = 1;
        }

        strokeArc(x, y, radius, color, strokeWidth) {
            this.context.beginPath();
            this.context.strokeStyle = color;
            this.context.lineWidth = strokeWidth;
            this.context.arc(x, y, radius, 0, 2 * Math.PI, false);
            this.context.stroke();
            this.context.closePath();
        }

        drawImage(image, x, y, radius) {
            this.context.save();
            this.context.clip();
            this.context.globalCompositeOperation = "source-atop";
            this.context.drawImage(image, x - radius, y - radius, radius * 2, radius * 2);
            this.context.restore();
        }

        drawImageByAngle(image, x, y, angle, radius) {
            this.context.save();

            this.context.translate(x, y);
            this.context.rotate(degreeToRadians(angle));
            this.context.clip();

            this.context.globalCompositeOperation = "source-atop";
            this.context.drawImage(image, -radius, -radius, radius * 2, radius * 2);
            this.context.restore();
        }

        getTextSize(size, text) {
            if (+gameSettings.isBigText) size *= 1.8;
            else if (gameSettings.isSmallText) size /= 1.3;
            else size *= 1.2;
            if (gameSettings.isOptimization) size /= 1.7;
            let font = gameSettings.isOptimization ? "'Open Sans'" : "'Caveat'";
            this.context.font = "bold " + String(size) + "px " + font;
            let measure = this.context.measureText(text);
            return measure.width;
        }

        drawText(x, y, size, value, color = "#FFFFFF", isStroke = false, strokeStyle = "#000000", isShadow = false, shadowColor = "red") {
            if (gameSettings.isBigText) size *= 1.8;
            else if (gameSettings.isSmallText) size /= 1.3;
            else size *= 1.2;
            if (gameSettings.isOptimization) size /= 1.7;

            this.context.save();

            if (gameSettings.isTextShadowColor) {
                this.setShadow(gameSettings.textShadowColor || "#000000");
            }

            let font = gameSettings.isOptimization ? "'Open Sans'" : "'Caveat'";

            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.font = "bold " + String(size) + "px " + font;
            if (gameSettings.isAlphaText) this.context.globalAlpha = 0.4;

            this.context.fillStyle = color;
            this.context.fillText(String(value), x, y);
            if (isStroke) {
                this.context.lineWidth = size / 50;
                this.context.strokeStyle = strokeStyle;
                this.context.strokeText(String(value), x, y);
            }
            this.context.globalAlpha = 1;
            this.context.restore();
        }

        drawCenter() {
            let image = isEmpty(dailyTop.skinId) ? imagesArr["center"] : imagesArr[dailyTop.skinId];
            if (!image) return true;

            let drawableX = this.canvas.width / 2 + (gameInfo.width / 2 - gameInfo.centerX) / gameInfo.scale;
            let drawableY = this.canvas.height / 2 + (gameInfo.height / 2 - gameInfo.centerY) / gameInfo.scale;
            if (drawableY < 0 || drawableY > this.canvas.height || drawableX < 0 || drawableX > this.canvas.width) return true;

            this.drawArc(drawableX, drawableY, gameInfo.centerImageRadius / gameInfo.scale, "#000000", true);
            this.drawImage(image, drawableX, drawableY, gameInfo.centerImageRadius / gameInfo.scale);
        }

        drawGrid() {
            let color = isEmpty(gameSettings.gridColor) ? "#000000" : gameSettings.gridColor;
            this.context.globalAlpha = 0.3;
            this.context.strokeStyle = color;
            this.context.lineWidth = 1;

            this.context.beginPath();
            let dX = (gameInfo.centerX - this.canvas.width / 2) % 20;
            for (let x = 20 - dX; x < this.canvas.width; x += 20) {
                this.context.moveTo(x, 0);
                this.context.lineTo(x, this.canvas.height);
            }

            let dY = (gameInfo.centerY - this.canvas.height) % 20;
            for (let y = 20 - dY; y < this.canvas.height; y += 20) {
                this.context.moveTo(0, y);
                this.context.lineTo(this.canvas.width, y);
            }
            this.context.stroke();
            this.context.closePath();

            this.context.globalAlpha = 1;

        }


        onResize() {
            [this.canvas.width, this.canvas.height] = [window.innerWidth, window.innerHeight];
        }

        setResizeListener() {
            this.onResize();
            window.addEventListener("resize", this.onResize);
        }

        clearCanvas() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        addFilters() {
            let filter = "";
            if (gameSettings.isGrayscale) filter += "grayscale(100%)";
            if (gameSettings.isInvertColor) filter += " invert(100%)";
            if (gameSettings.isBrigthness) filter += " brightness(150%)";
            if (gameSettings.isSepia) filter += " sepia(100%)";
            this.context.filter = filter || "none";
        }

        fillBackground() {
            if (gameSettings.isBackgroundImage && imagesArr["background_image"]) {
                this.context.drawImage(imagesArr['background_image'], 0, 0, this.canvas.width, this.canvas.height);
            } else {
                let backgroundColor = (gameSettings.isBackground && !isEmpty(gameSettings.background)) ? gameSettings.background : "#000000";
                this.context.fillStyle = backgroundColor;
                this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }


    class Arc {

        constructor() {
            this.isShow = true;
        }


        clear() {
            if (!canvas.checkInCanvas(this)) return true;
            this.isShow = false;
        }


        get drawableRadius() {
            return Math.sqrt(this.mass / Math.PI) * 3;
        }

        get mouseAngle() {
            let dX = this.owner.mouse.x - this.x;
            let dY = this.owner.mouse.y - this.y;
            let c = Math.sqrt(dX ** 2 + dY ** 2);
            if (c < 10) return 0;
            return getAngle(dY / c, dX / c).degree;
        }

        outOfBorder() {
            return (this.x <= 0 || this.x >= gameInfo.width || this.y <= 0 || this.y >= gameInfo.height);
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
            // rendersArr.push(this);
        }

    }

    class Bullet extends Arc {

        constructor(x, y, sin, cos, mass, distance, color = "#ff0400", isDecreaseMass = false) {
            super();

            this.x = x;
            this.y = y;
            this.sin = sin;
            this.cos = cos;
            this.mass = mass;
            this.distance = distance;
            this.color = color;
            this.isDecreaseMass = isDecreaseMass;
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

        }

    }

    class Virus extends Arc {

        constructor(x, y, sin, cos, distance = 0, mass = 200, color = "#fff500", isFeeding = false) {
            super();

            this.x = x;
            this.y = y;
            this.sin = sin;
            this.cos = cos;
            this.distance = distance;
            this.mass = mass;
            this.toMass = 0;
            this.color = color;
            this.isFeeding = isFeeding;

            this.sX = 0;
            this.sY = 0;
            this.cX = 0;
            this.cY = 0;
        }

        update(delta = 1) {
            this.x = this.sX;
            this.y = this.sY;

            if (Math.abs(this.toMass) > 0) {
                let speed = this.toMass * delta / 2.5;
                if (Math.abs(speed) < 1) speed = this.toMass >= 0 ? 1 : -1;
                if (Math.abs(this.toMass) < Math.abs(speed)) speed = this.toMass;

                this.mass = Math.round(this.mass + speed);
                this.toMass = Math.round(this.toMass - speed);

            }


        }

        changePos(virus) {
            // this.toMass = virus.mass - this.mass;

            this.cY = this.y;
            this.cX = this.x;
            this.sX = virus.x;
            this.sY = virus.y;
            // this.toMass = virus.mass - this.mass;
            this.mass = virus.mass;
        }

    }

    class BlackHole extends Arc {

        constructor(x, y, mass, angle, color) {
            super();

            this.x = x;
            this.y = y;
            this.mass = mass;
            this.angle = angle;
            this.color = color;

            this.cX = 0;
            this.cY = 0;
            this.sX = 0;
            this.sY = 0;
        }

        update() {
            this.x = this.sX;
            this.y = this.sY;

        }

        changePos(blackHole) {
            this.cX = this.x;
            this.cY = this.y;

            this.sX = blackHole.x;
            this.sY = blackHole.y;
            this.angle = blackHole.a;
            this.mass = blackHole.mass;

        }

    }

    class Enemy extends Arc {
        constructor(x, y, mass, color) {
            super();

            this.x = x;
            this.y = y;
            this.sX = x;
            this.sY = y;
            this.mass = mass;
            this.color = color;
        }

        update() {
            this.x = this.sX;
            this.y = this.sY;

        }

        changePos(enemy) {
            this.sX = enemy.x;
            this.sY = enemy.y;
            this.mass = enemy.mass;
        }
    }


    class Cell extends Arc {

        constructor(id, owner, x, y, mass, main = false, color = "#000000") {
            super();

            this.x = x;
            this.y = y;
            this.mass = mass;
            this.main = main;
            this.owner = owner;
            this.color = color;
            this.id = id;
            this.toMass = 0;
            this.cX = 0;
            this.cY = 0;
            this.sX = x;
            this.sY = y;

        }



        update(delta = 1) {
            if (delta > 1) delta = 1;

            this.x = this.sX;
            this.y = this.sY;


            if (Math.abs(this.toMass) > 0) {
                let speed = this.toMass * delta / 5;
                if (Math.abs(speed) < 1) speed = this.toMass >= 0 ? 1 : -1;
                if (Math.abs(this.toMass) < Math.abs(speed)) speed = this.toMass;

                this.mass = Math.round(this.mass + speed);
                this.toMass = Math.round(this.toMass - speed);

            }


            this.updateCenterDrawable();
        }

        updateCenterDrawable() {
            if (!this.owner.current) return true;

            if (!this.main) return true;

            let differentX = this.x - gameInfo.centerX;
            let differentY = this.y - gameInfo.centerY;

            let distance = Math.sqrt(differentX ** 2 + differentY ** 2);
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

    }


    class Player {
        skinId = null;
        ids = [];
        totalMass = 0;
        mass = 0;
        score = 0;
        stickersSet = null;
        stickerI = null;
        isTransparentSkin = false;
        isTurningSkin = false;
        isInvisibleNick = false;
        isRandomNickColor = false;
        clan = "";
        nickImage = null;
        message = null;
        messageStartTime = performance.now();

        constructor(x, y, mass, color = "#000000", current = false, id, nick, skin = "", skinId = "", isTransparentSkin = false, isTurningSkin = false, isInvisibleNick = false, clan = "", isRandomNickColor = false) {
            this.skin = skin;
            this.skinId = skinId;
            this.isTransparentSkin = isTransparentSkin;
            this.isTurningSkin = isTurningSkin;
            this.isInvisibleNick = isInvisibleNick;
            this.isRandomNickColor = isRandomNickColor;

            this.mouse = {
                x: mouseCoords.x,
                y: mouseCoords.y
            };

            this.cells = [
                new Cell(0, this, x, y, mass, current, color)
            ];
            this.current = current;
            this.updateI = 0;
            this.id = id;
            this.nick = nick;
            this.clan = clan;
            this.color = color;
            this.selectedColor = color;
            this.x = x;
            this.y = y;

            this.isFirstUpdate = true;
        }

        setMessage(message) {
            this.message = message;
            this.messageStartTime = performance.now();
        }

        createNickImage() {
            // this.nickImage = null;
            let c = document.createElement("canvas");
            [c.width, c.height] = [512, 512];
            let ctx = c.getContext("2d");
            ctx.clearRect(0, 0, c.width, c.height);
            // ctx.save();


            let font = gameSettings.isOptimization ? "'Open Sans'" : "'Caveat'";

            let clanColor = "#FFFFFF";
            if (gameSettings.isClanCellColor) clanColor = gameSettings.clanCellColor || "#FFD700";


            let size = 60;

            let textSize = canvas.getTextSize(size, this.clan + this.nick);
            let clanSize = canvas.getTextSize(size, this.clan);
            let nickSize = canvas.getTextSize(size, this.nick);
            if (textSize > c.width) {
                textSize = Math.ceil(textSize);
                [c.width, c.height] = [textSize, textSize];
                // let ratio = textSize / c.width;
                // clanSize /= ratio;
                // nickSize /= ratio;
                // size /= ratio;
                // textSize /= ratio;
            }

            let sizesArr = [];
            let nick = this.nick.split("");
            for (let letter of nick) {
                sizesArr.push(canvas.getTextSize(size, letter));
            }

            if (gameSettings.isBigText) size *= 1.8;
            else if (gameSettings.isSmallText) size /= 1.3;
            else size *= 1.2;
            if (gameSettings.isOptimization) size /= 1.7;


            ctx.save();

            if (gameSettings.isTextShadowColor) {
                ctx.shadowColor = gameSettings.textShadowColor || "#000000";
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }

            let color = "#FFFFFF";
            if (gameSettings.isCellNickColor) color = gameSettings.cellNickColor || "#FFFFFF";

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "bold " + size + "px " + font;
            ctx.lineWidth = 1;
            ctx.strokeStyle = "black";
            if (gameSettings.isAlphaText) ctx.globalAlpha = 0.4;

            if (this.isRandomNickColor && !gameSettings.isClanCellColor && !gameSettings.isCellNickColor) {
                let totalLettersSize = 0;
                for (let [key, s] of Object.entries(sizesArr)) {
                    ctx.fillStyle = getRandomColor();
                    ctx.fillText(nick[key], c.width / 2 - textSize / 2 + s / 2 + totalLettersSize, c.width / 2);
                    ctx.strokeText(nick[key], c.width / 2 - textSize / 2 + s / 2 + totalLettersSize, c.width / 2);
                    totalLettersSize += s - 1;
                }
            } else {
                if (!isEmpty(this.clan)) {
                    ctx.fillStyle = clanColor;
                    ctx.fillText(this.clan, c.width / 2 - textSize / 2 + clanSize / 2, c.width / 2);
                    ctx.strokeText(this.clan, c.width / 2 - textSize / 2 + clanSize / 2, c.width / 2);
                }
                ctx.fillStyle = color;
                ctx.fillText(this.nick, c.width / 2 + textSize / 2 - nickSize / 2, c.width / 2);
                ctx.strokeText(this.nick, c.width / 2 + textSize / 2 - nickSize / 2, c.width / 2);
            }
            ctx.globalAlpha = 1;

            ctx.restore();

            let dataUrl = c.toDataURL("image/png", 1.0);
            let img = new Image();
            img.onload = () => this.nickImage = img;
            img.src = dataUrl;
            // this.context.restore();
        }


        findMainCell() {
            for (let i = 0; i < this.cells.length; i++) {
                if (this.cells[i].main) return this.cells[i];
            }

            return null;
        }

        loadImage() {
            if (isEmpty(this.skin) || isEmpty(this.skinId)) return false;
            loadImage(this.skinId, this.skin);
        }

        setNick(nick, skin, skinId, isTransparentSkin, isTurningSkin, isInvisibleNick, clan = "", isRandomNickColor) {
            this.nick = nick;
            this.skin = skin;
            this.skinId = skinId;
            this.isTransparentSkin = isTransparentSkin;
            this.isTurningSkin = isTurningSkin;
            this.isInvisibleNick = isInvisibleNick;
            this.isRandomNickColor = isRandomNickColor;
            this.clan = clan;
            this.loadImage();
            this.createNickImage();
        }

        update(delta = 1) {
            if (this.isFirstUpdate) {
                this.loadImage();
                this.createNickImage();
                this.isFirstUpdate = false;
            }
            if (this.message !== null && performance.now() - this.messageStartTime > 3000) {
                this.message = null;
            }

            if (isNeedUpdateNickImages) this.createNickImage();

            if (this.current) {
                if (this.cells.length === 0) {
                    isSpectate = true;
                    return true;
                } else isSpectate = false;
            }

            this.updateI = 0;
            for (; this.updateI < this.cells.length; this.updateI++) {
                this.cells[this.updateI].update(delta);
            }

            const mainCell = this.findMainCell();
            [this.x, this.y] = [mainCell.x, mainCell.y];
        }

        mouseMove(x, y) {
            [this.mouse.x, this.mouse.y] = [x, y];
        }


        changePos(player) {
            this.color = player.color;
            this.selectedColor = player.selectedColor;
            this.score = player.score;
            this.mass = player.mass;
            this.mouseMove(player.mouse.x, player.mouse.y);

            let length = player.cells.length;
            this.ids = [];
            for (let i = 0; i < length; i++) {
                let cell = this.findCell(player.cells[i].id);
                let pCell = player.cells[i];
                this.ids.push(+pCell.id);
                if (!cell) {
                    let c = new Cell(pCell.id, this, pCell.x, pCell.y, pCell.mass, pCell.main, this.color);
                    this.cells.push(c);
                    continue;
                }

                try {
                    // this.cells[cell.count].color = this.color;
                    this.cells[cell.count].sX = pCell.x;
                    this.cells[cell.count].sY = pCell.y;
                    this.cells[cell.count].cX = this.cells[cell.count].x;
                    this.cells[cell.count].cY = this.cells[cell.count].y;
                    this.cells[cell.count].toMass = pCell.mass - this.cells[cell.count].mass;
                    this.cells[cell.count].main = pCell.main;
                    this.cells[cell.count].color = this.color;
                } catch (e) {
                }

            }
            this.deleteCells();
        }

        deleteCells() {
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


    let mouseCoords = {
        x: 0,
        y: 0
    };

    let coordsHtml = $("#coords");
    let fps = $("#coords .fps .value");
    let ping = $("#coords .ping .value");


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
        $(this).blur();
    });

    document.addEventListener("keypress", function (event) {
        if (event.code.toLowerCase() === "enter") $("#message_text").focus();
    });


    class Game {
        rendersArr = [];
        bulletsArr = [];
        virusArr = [];
        foodsArr = [];
        blackHoleArr = [];
        playersArr = [];
        enemyArr = [];
        states = new GameStates();

        renderVar = null;


        lastKeyPressTime = {};
        preventDefault = ["tab"];
        keyPressed = [];
        isSticker = false;

        wheel = 0;

        startPingTime = 0;
        lastFpsUpdate = 0;
        allPlayersTimeout = null;

        constructor() {
            ws = null;

            this.setListeners();
            this.loadGameImages();
        }

        loadGameImages() {
            loadImage("virus_arrow", "/src/images/virus_arrow1.png");
            loadImage("feeding_virus", "/src/images/feeding_virus.png");
            loadImage("center", "/src/images/logo.png");
            loadImage("food", "/src/images/star.png");
            loadImage("black_hole", "/src/images/black_hole.png");
            loadImage("enemy", "/src/images/enemy.png");
        }


        setListeners() {
            this.setMouseListeners();
            this.setKeyBoardsListeners();
        }

        setMouseListeners() {
            document.getElementsByTagName("body")[0].addEventListener("mousemove", event => {
                let coords = canvas.getMapCoords(event.clientX, event.clientY);
                [mouseCoords.x, mouseCoords.y] = [coords.x, coords.y];

                if (!ws) return true;

                ws.sendJson({
                    action: "mouse_move",
                    x: mouseCoords.x,
                    y: mouseCoords.y
                });

            });

            document.getElementById("screenshot").addEventListener("click", function () {
                if (!ws || !isGame) return true;
                let link = document.createElement("a");
                link.href = canvas.toDataUrl();
                link.download = "screen.png";
                link.click();
            });


            window.addEventListener("wheel", event => {
                let byScale = event.deltaY > 0 ? 0.1 : -0.1;
                if (Math.abs(this.wheel + byScale) > 0.5) return true;

                this.wheel += byScale;
                gameInfo.byScale += byScale;
            });
            document.getElementById("game_settings").addEventListener("wheel", event => event.stopPropagation());

            $("body").on("click", function (e) {
                if (!isSpectate) return true;

                gameInfo.byCenterX = e.clientX - window.innerWidth / 2;
                gameInfo.byCenterY = e.clientY - window.innerHeight / 2;
            });
        }

        setKeyBoardsListeners() {

            window.addEventListener("keydown", function (event) {
                let code = event.code.toLowerCase();
                if (code in this.lastKeyPressTime) {
                    if (performance.now() - this.lastKeyPressTime[code] < 100) {
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                    }
                }
                this.lastKeyPressTime[code] = performance.now();

                if (this.preventDefault.includes(code)) event.preventDefault();
                if (this.keyPressed.includes(code)) return true;
                this.keyPressed.push(code);
                if (code === "tab") {
                    if (!ws) return true;
                    this.showOnline();
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
                    this.clearFood();
                    return true;
                }

                if (code === "keyw") {
                    if (typeof ws !== "undefined") {
                        ws.sendJson({action: "player_shoot"});
                    }
                    return true;
                }

                if (code === "space") {
                    if (typeof ws !== "undefined") {
                        ws.sendJson({
                            action: "player_split"
                        });
                    }
                    return true;
                }

                if (code === "keyd") {
                    if (!ws) return true;
                    ws.sendJson({
                        action: "d_split"
                    });
                    return true;
                }


                if (["digit1", "digit2", "digit3", "digit4", "digit5", "digit6", "digit7", "digit8", "digit9"].includes(code)) {
                    if (this.isSticker) {
                        this.keyPressed.splice(this.keyPressed.indexOf(code), 1);
                        return true;
                    }
                    if (!ws) return true;

                    let player = this.getCurrentPlayer();
                    if (!player) return true;

                    this.isSticker = true;
                    let stickerNumber = +code.substr(-1) - 1;
                    this.playersArr[player.count].stickerI = stickerNumber;

                    ws.sendJson({
                        action: "select_sticker",
                        number: stickerNumber
                    });
                    return true;
                }
            }.bind(this));
            window.addEventListener("keyup", function (event) {
                let code = event.code.toLowerCase();
                if (this.preventDefault.includes(code)) event.preventDefault();

                let i = this.keyPressed.indexOf(code);
                if (i < 0) return true;
                this.keyPressed.splice(i, 1);
                if (code === "tab") {
                    $("#online_players").addClass("closed");
                    return true;
                }
                if (["digit1", "digit2", "digit3", "digit4", "digit5", "digit6", "digit7", "digit8", "digit9"].includes(code)) {
                    this.isSticker = false;
                    if (!ws) return true;
                    let player = this.getCurrentPlayer();
                    if (!player) return true;

                    this.playersArr[player.count].stickerI = null;
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

                if (code === "keym") {
                    if (!isAdmin && !isModer) return true;
                    $("#admin_panel").toggleClass("closed");
                }

            }.bind(this));
        }

        calcScaleByCell() {
            let player = this.getCurrentPlayer();
            if (!player) return null;

            return 0.01 * (player.player.cells.length - 1);
        }

        getCurrentPlayer() {
            for (let i = 0; i < this.playersArr.length; i++) {
                let player = this.playersArr[i];
                if (player.current) return {player, count: i};
            }

            return null;
        }

        updateUnitsByState() {
            let newTime = gameInfo.lastStateTime + performance.now() - gameInfo.lastStateTimeLocal - gameInfo.differentStateTime;
            let state = gameInfo.lastStateTime ? this.states.getStateByTime(newTime) : this.states.getGameState();


            if (state) {
                this.states.executeCommands(gameInfo.lastStateTime);

                gameInfo.differentStateTime = gameInfo.lastStateTime ? (state.time - newTime) : 0;

                gameInfo.lastStateTime = state.time;
                gameInfo.lastStateTimeLocal = performance.now();


                for (let i = 0; i < state.players.length; i++) {
                    let sPlayer = state.players[i];

                    let player = this.findPlayer(sPlayer.id);
                    if (!player) continue;
                    player.changePos(sPlayer);
                }

                for (let i = 0; i < state.virus.length; i++) {
                    let sVirus = state.virus[i];
                    let virus = this.findVirus(sVirus.id);
                    if (!virus) continue;
                    virus.virus.changePos(sVirus);
                }

                for (let i = 0; i < state.blackHole.length; i++) {
                    let sBlackHole = state.blackHole[i];
                    let blackHole = this.findBlackHole(sBlackHole.id);
                    if (!blackHole) continue;
                    blackHole.blackHole.changePos(sBlackHole);
                }

                for (let i = 0; i < state.enemy.length; i++) {
                    let sEnemy = state.enemy[i];
                    let enemy = this.findEnemy(sEnemy.id);
                    if (!enemy) continue;
                    enemy.enemy.changePos(sEnemy);
                }
            }
        }

        updateScaleByCells() {
            let cellScale = this.calcScaleByCell();
            if (!isEmpty(cellScale)) {
                gameInfo.byScale += cellScale - gameInfo.cellScale;
                gameInfo.cellScale = cellScale;
            }
        }

        updateByScale() {
            if (Math.abs(gameInfo.byScale) > 0) {
                let speed = gameInfo.byScale * (gameInfo.deltaTime / gameInfo.perSecond) / 30;
                if (Math.abs(speed) < 0.01) speed = gameInfo.byScale > 0 ? 0.01 : -0.01;
                if (Math.abs(gameInfo.byScale) < Math.abs(speed)) speed = gameInfo.byScale;

                gameInfo.scale += speed;
                gameInfo.byScale -= speed;
            }
        }

        updateDrawableCenter() {
            if (Math.abs(gameInfo.byCenterX) > 0 || Math.abs(gameInfo.byCenterY) > 0) {

                let c = Math.sqrt(gameInfo.byCenterX ** 2 + gameInfo.byCenterY ** 2);
                let sin = gameInfo.byCenterY / c;
                let cos = gameInfo.byCenterX / c;
                let byY = c * sin / 10;
                let byX = c * cos / 10;
                gameInfo.centerY += byY;
                gameInfo.centerX += byX;
                gameInfo.byCenterY -= byY;
                gameInfo.byCenterX -= byX;

                if (gameInfo.centerY < 0) {
                    gameInfo.centerY = 0;
                    gameInfo.byCenterY = 0;
                } else if (gameInfo.centerY > gameInfo.height) {
                    gameInfo.centerY = gameInfo.height;
                    gameInfo.byCenterY = 0;
                }

                if (gameInfo.centerX < 0) {
                    gameInfo.centerX = 0;
                    gameInfo.byCenterX = 0;
                } else if (gameInfo.centerX > gameInfo.width) {
                    gameInfo.centerX = gameInfo.width;
                    gameInfo.byCenterX = 0;
                }

            }
        }

        updateUnits(delta) {
            for (let i = 0; i < this.playersArr.length; i++) {
                this.playersArr[i].update(delta);
                this.rendersArr = this.rendersArr.concat(this.playersArr[i].cells);
            }

            for (let i = 0; i < this.bulletsArr.length; i++) {
                this.bulletsArr[i].update(delta);
                this.rendersArr.push(this.bulletsArr[i]);
            }

            for (let i = 0; i < this.virusArr.length; i++) {
                this.virusArr[i].update(delta);
                this.rendersArr.push(this.virusArr[i]);
            }

            for (let i = 0; i < this.blackHoleArr.length; i++) {
                this.blackHoleArr[i].update();
                this.rendersArr.push(this.blackHoleArr[i]);
            }

            for (let i = 0; i < this.enemyArr.length; i++) {
                this.enemyArr[i].update();
                this.rendersArr.push(this.enemyArr[i]);
            }
        }

        drawUnits() {
            if (gameSettings.isGrid) canvas.drawGrid();
            canvas.drawCenter();

            for (let i = 0; i < this.foodsArr.length; i++) {
                canvas.render(this.foodsArr[i]);
            }

            this.rendersArr = this.rendersArr.sort((a, b) => a.drawableRadius - b.drawableRadius);
            let renderLength = this.rendersArr.length;
            for (let i = 0; i < renderLength; i += 2) {
                canvas.render(this.rendersArr[i]);
                try {
                    canvas.render(this.rendersArr[i + 1]);
                } catch (e) {
                }

            }
        }

        loop() {
            new Promise(() => {
                if (performance.now() - gameInfo.updateTime < gameInfo.perSecond) return this.renderVar = requestAnimationFrame(this.loop.bind(this));


                gameInfo.deltaTime = performance.now() - gameInfo.updateTime;
                gameInfo.updateTime = performance.now();
                let delta = getTimeByDelta(gameInfo.deltaTime);
                let fps = 1000 / gameInfo.deltaTime;
                if (fps < 15 && !gameSettings.isDisableAutoClear) this.clearFood();


                if (performance.now() - gameInfo.lastStateTimeLocal >= gameInfo.differentStateTime || true) {
                    this.updateUnitsByState();
                }

                canvas.clearCanvas();
                canvas.addFilters();
                canvas.fillBackground();

                this.updateScaleByCells();
                this.updateByScale();
                this.updateDrawableCenter();

                this.rendersArr = [];
                this.updateUnits(delta);
                this.drawUnits();

                // Arc.drawCompass();
                isNeedUpdateNickImages = false;
                this.renderVar = requestAnimationFrame(this.loop.bind(this));
            });


        }

        updateHtml() {
            let player = this.getCurrentPlayer();

            if (player) {
                for (let [key, value] of Object.entries([player.player.cells.length, Math.floor(player.player.mass), "x: " + Math.floor(gameInfo.centerX * 10) + " y: " + Math.floor(gameInfo.centerY * 10)])) {
                    coordsHtml.find(".value:eq(" + key + ")").text(value);
                }
            }
            if (performance.now() - this.lastFpsUpdate > 1000 && gameInfo.deltaTime) {
                fps.text(Math.round(1000 / gameInfo.deltaTime));
                this.lastFpsUpdate = performance.now();
            }
            requestAnimationFrame(this.updateHtml.bind(this));
        }

        getAllPlayers() {
            if (!isAdmin && !isModer) return true;

            let html = "";
            for (let i = 0; i < this.playersArr.length; i++) {
                let player = this.playersArr[i];
                html += "<div class='flex_row player' data-id='" + player.id + "' data-nick='" + player.nick + "'><span class='id'>" + player.id + "</span><span class='nick' style='color: " + player.selectedColor + ";'>" + player.nick + "</span><span class='mass'>" + Math.floor(player.mass) + "</span></div>";
            }
            $("#players_for_admin .data").html(html);

            this.allPlayersTimeout = setTimeout(this.getAllPlayers.bind(this), 2000);
        }

        getTopPlayers() {
            let arr = this.playersArr.sort((a, b) => b.score - a.score);
            let html = "";
            let top = 0;
            for (let player of arr) {
                if (player.cells.length === 0) continue;
                let cl = "";
                if (player.current) cl = "current";
                html += "<div class='flex_row " + cl + "'><span class='number'>" + (+top + 1) + "</span><span class='nick'>" + player.nick + "</span><span class='mass'>" + Math.floor(player.score) + "</span></div>";
                top++;
                if (top === 10) break;
            }
            $("#top_players").html(html);
            setTimeout(this.getTopPlayers.bind(this), 2000);
        }

        showOnline() {
            $("#online_players > div").empty();
            for (let i = 0; i < this.playersArr.length; i++) {
                let player = this.playersArr[i];
                let html = "<div class='player_online' data-pid='" + player.id + "' data-nick='" + player.nick + "' style='color: " + player.color + "'>" + player.nick + "</div>";
                $("#online_players > div").append(html);
            }
            $("#online_players .total_players").text(this.playersArr.length);
            $("#online_players").removeClass("closed");
        }

        getUnit(unit) {
            let returned = null;
            if (typeof (unit) === "string") unit = unit.split(",");
            let name = Array.isArray(unit) ? unit[0] : unit.n;

            if (name === "p") {
                let current = unit.cr === "t";
                let player = new Player(0, 0, 0, unit.cl, current, unit.id, unit.nick, "", "", Boolean(+unit.its), Boolean(+unit.itrs), Boolean(+unit.iin), unit.cn, Boolean(+unit.irn));
                player.mouse.x = unit.x;
                player.mouse.y = unit.y;
                player.skin = unit.skin;
                player.skinId = unit.skinId;
                player.stickersSet = null;
                if (!isEmpty(unit.stickersSet)) player.loadStickers(unit.stickersSet);
                player.stickerI = isEmpty(unit.stickerI) ? null : unit.stickerI;
                player.selectedColor = unit.s;
                player.score = unit.sc;
                player.mass = unit.m;

                let cellsArr = unit.c.split(",");
                let length = cellsArr.length;
                let arr = [];
                if (length >= 5) {
                    for (let i = 0; i < length; i += 5) {

                        let c = new Cell(+cellsArr[i], player, +cellsArr[i + 1] || 0, +cellsArr[i + 2] || 0, +cellsArr[i + 3] || 0, cellsArr[i + 4] === "t", player.color);
                        arr.push(c);

                    }
                }
                player.cells = arr;
                returned = player;

            } else if (name === "f") {
                let food = new Food(+unit[2], +unit[3], +unit[4], unit[5]);
                food.toMass = 0;
                food.id = +unit[1];

                returned = food;

            } else if (name === "b") {
                let bullet = new Bullet(+unit[2], +unit[3], +unit[4], +unit[5], +unit[6], +unit[7], unit[8], unit[9] === "t");
                bullet.toMass = 0;
                bullet.id = +unit[1];

                returned = bullet;

            } else if (name === "v") {
                let virus = new Virus(+unit[2], +unit[3], 0, 0, 0, +unit[4], "#fff500", unit[5] === "t");
                virus.id = +unit[1];
                virus.sX = +unit[2];
                virus.sY = +unit[3];

                returned = virus;

            } else if (name === "bh") {
                let blackHole = new BlackHole(+unit[2], +unit[3], +unit[4], +unit[5], "#000000");
                blackHole.id = +unit[1];
                blackHole.sX = +unit[2];
                blackHole.sY = +unit[3];

                returned = blackHole;
            } else if (name === "e") {
                let enemy = new Enemy(+unit[2], +unit[3], +unit[4], unit[5]);
                enemy.id = +unit[1];

                returned = enemy;
            }

            return returned;
        }


        addUnit(unit, delta = 1) {
            let name = unit.constructor.name.toLowerCase();
            if (name === "player") {
                let currentPlayer = this.getCurrentPlayer();
                if (this.playersArr.length > 0 && currentPlayer && +currentPlayer.player.id === unit.id) return true;

                unit.loadImage();
                if (unit.current) {
                    if (currentPlayer) return true;
                    this.playersArr.unshift(unit);
                    this.playersArr[0].update(delta);

                    // ws.sendJson({action: "get_all_units"});

                    setTimeout(() => {
                        gameInfo.updateTime = performance.now();
                        this.loop();
                        this.updateHtml();
                        this.getTopPlayers();
                        isGame = true;
                    }, 10);
                    return true;
                }
                this.playersArr.push(unit);

                return true;
            }
            if (name === "food") {
                this.foodsArr.push(unit);
                return true;
            }
            if (name === "bullet") {
                this.bulletsArr.push(unit);
                return true;
            }
            if (name === "virus") {
                this.virusArr.push(unit);
                return true;
            }

            if (name === "blackhole") {
                this.blackHoleArr.push(unit);
                return true;
            }

            if (name === "enemy") {
                this.enemyArr.push(unit);
                return true;
            }

        }

        destroyUnit(type, id) {
            let arr = [];
            if (type === "virus") arr = this.virusArr;
            else if (type === "food") arr = this.foodsArr;
            else if (type === "bullet") arr = this.bulletsArr;
            else if (type === "player") arr = this.playersArr;

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
        findPlayer(id) {
            let length = this.playersArr.length;
            let player = null;
            for (let i = 0; i < length; i++) {
                if (+this.playersArr[i].id !== +id) continue;
                player = this.playersArr[i];
                break;
            }

            return player;
        }

        /**
         * @param id number
         * @return {null|{count: number, virus: Virus}}
         */
        findVirus(id) {
            id = +id;
            let count = 0;
            let virus = null;
            for (let i = 0; i < this.virusArr.length; i++) {
                if (+this.virusArr[i].id === id) {
                    virus = this.virusArr[i];
                    count = i;
                    break;
                }
            }

            if (!virus) return null;
            return {virus, count};
        }

        /**
         * @param id
         * @return {null|{count: number, blackHole: BlackHole}}
         */
        findBlackHole(id) {
            id = +id;
            let count = 0;
            let blackHole = null;
            for (let i = 0; i < this.blackHoleArr.length; i++) {
                if (+this.blackHoleArr[i].id === id) {
                    blackHole = this.blackHoleArr[i];
                    count = i;
                    break;
                }
            }

            if (!blackHole) return null;
            return {blackHole, count};
        }

        /**
         * @param id
         * @return {{count: number, enemy: Enemy}|null}
         */
        findEnemy(id) {
            id = +id;
            let count = 0;
            let enemy = null;
            for (let i = 0; i < this.enemyArr.length; i++) {
                if (this.enemyArr[i].id === id) {
                    enemy = this.enemyArr[i];
                    count = i;
                    break;
                }
            }

            if (!enemy) return null;
            return {enemy, count};
        }


        clearFood() {
            for (let i = 0; i < this.foodsArr.length; i++) {
                this.foodsArr[i].clear();
            }
            for (let i = 0; i < this.bulletsArr.length; i++) {
                this.bulletsArr[i].clear();
            }
        }

        clearAll() {
            this.rendersArr = [];
            this.playersArr = [];
            this.enemyArr = [];
            this.foodsArr = [];
            this.blackHoleArr = [];
            this.bulletsArr = [];
            this.virusArr = [];
        }

        startGame(ip, spect = false) {
            isSpectate = spect;
            isGame = false;
            this.clearAll();
            try {
                ws.close();
            } catch {
            }
            ws = null;
            ws = new Ws("ws://" + ip);

            ws.on("open", () => {
                ws.sendJson({
                    action: "player_connect",
                    clan: $("#clan_for_game").val().trim().substr(0, 15) || "",
                    nick: $("#nick_for_game").val().trim().substr(0, 15) || "SandL",
                    password: $("#password_for_game").val().trim(),
                    color: $("#select_color").val(),
                    token: getCookie("Token") || "",
                    userId: getCookie("User-Id") || "",
                    type: spect ? "spectator" : "player"
                });
                this.startPingTime = performance.now();
                ws.sendJson({action: "ping"});

            });
            ws.on("message", event => {
                // let data = event.data;
                let data = arrayBufferToString(event.data);
                try {
                    data = JSON.parse(data);
                    if (typeof (data) !== "object") throw("Error");
                } catch {
                    return true;
                }

                if ("a" in data && data.a === "u") {
                    delete data.action;


                    let players = [];
                    let virus = [];
                    let blackHole = [];
                    let enemy = [];
                    for (let i = 0; i < data.u.length; i++) {
                        let unit = this.getUnit(data.u[i]);
                        let name = unit.constructor.name.toLowerCase();
                        if (name === "player") players.push(unit);
                        else if (name === "virus") virus.push(unit);
                        else if (name === "blackhole") blackHole.push(unit);
                        else if (name === "enemy") enemy.push(unit);
                    }

                    // states.removeFirstState();
                    this.states.addGameState({time: data.time, players, virus, blackHole, enemy});
                    if (gameInfo.lastStateTime) {
                        this.states.removeBeforeState(gameInfo.lastStateTime + performance.now() - gameInfo.lastStateTimeLocal - gameInfo.differentStateTime);
                    }
                }

                if (data.action === "load_game_settings") {
                    gameInfo.width = data.settings.width;
                    gameInfo.height = data.settings.height;
                    gameInfo.connectTime = data.settings.connectTime;
                    gameInfo.maxCells = data.settings.maxCells;
                    if (isSpectate) {
                        gameInfo.centerX = gameInfo.width / 2;
                        gameInfo.centerY = gameInfo.height / 2;
                    }
                }

                if (data.action === "spawn_unit") {
                    delete data.action;
                    let unit = this.getUnit(data.unit);

                    if (!isGame) this.addUnit(unit, 1);
                    else this.states.addGameCommand({time: data.time, command: "spawn_unit", unit});


                    return true;
                }

                if (data.action === "get_all_units") {
                    let arr = data.u;
                    let length = arr.length;

                    for (let i = 0; i < length; i++) {
                        let unit = this.getUnit(arr[i]);
                        this.addUnit(unit);
                    }

                    return true;
                }

                if (data.action === "player_disconnect") {

                    for (let i = 0; i < this.playersArr.length; i++) {
                        if (+this.playersArr[i].id !== +data.id) continue;
                        this.playersArr.splice(i, 1);
                        break;
                    }

                    return true;
                }

                if (data.action === "chat_message") {
                    Message.getNewMessage(data);
                    let player = this.findPlayer(data.id);
                    if (!player) return true;
                    player.setMessage(data.message);
                    return true;
                }

                if (data.action === "ping") {
                    let delta = performance.now() - this.startPingTime;
                    ping.text(Math.round(delta / 2));

                    setTimeout(() => {
                        this.startPingTime = performance.now();
                        ws.sendJson({action: "ping"});
                    }, 1000);
                    return true;
                }

                if (data.action === "nick_info") {
                    isAdmin = +data.is_admin;
                    isModer = +data.is_moder;
                    try {
                        clearTimeout(this.allPlayersTimeout);
                    } catch {
                    }
                    onNickInfo();
                    if (isAdmin || isModer) {
                        this.allPlayersTimeout = setTimeout(this.getAllPlayers.bind(this), 2000);
                    }
                    return true;
                }

                if (data.action === "game_message") {
                    Message.gameMessage(data.message);
                    return true;
                }

                if (data.action === "select_sticker_set") {
                    let player = this.findPlayer(data.id);
                    if (!player) return true;

                    player.loadStickers(data.stickers);
                    return true;
                }

                if (data.action === "change_nick") {
                    let player = this.findPlayer(data.id);
                    if (!player) return true;

                    player.setNick(data.nick, data.skin, data.skinId, Boolean(+data.isTransparentSkin), Boolean(+data.isTurningSkin), Boolean(+data.isInvisibleNick), data.clan, Boolean(+data.isRandomNickColor));

                    return true;
                }

                if (data.action === "select_sticker") {
                    let player = this.findPlayer(data.id);
                    if (!player) return true;

                    if (isEmpty(data.number)) data.number = null;
                    player.stickerI = data.number;

                    return true;
                }


                if (data.action === "destroy_unit") {
                    this.states.addGameCommand({
                        time: data.time,
                        type: data.type,
                        id: data.id,
                        command: "destroy_unit"
                    });
                    // destroyUnit(data.type, data.id);
                    return true;
                }

                if (data.action === "get_daily_top") {
                    dailyTop = data.top;
                    loadImage(data.top.skinId, data.top.skin);
                }

                if (data.action === "report") {
                    Admin.addReport(+data.id, data.nick, +data.targetId, data.targetNick);
                    return true;
                }

            });

            ws.on("close", function () {
                ws = null;
            });
        }

    }


    let canvas = new Canvas();
    let game = new Game();


    function getSelectedServer() {
        let selected = $(".server.selected");
        if (selected.length !== 1) return false;

        let ip = selected.attr("data-ip");
        $("#main_menu").addClass("closed");
        return ip;
    }

    document.getElementById("into_game_button").addEventListener("click", function () {

        let ip = getSelectedServer();
        if (!ip) return true;

        let nick = $("#nick_for_game").val().trim();
        let password = $("#password_for_game").val().trim();
        if (ws && ws.address === "ws://" + ip) {
            if (isSpectate) {
                ws.sendJson({
                    action: "respawn_player"
                });
                isSpectate = false;
            }
            changeNick(nick, password, $("#clan_for_game").val().trim());
            return true;
        }
        addLocalNick(nick, password);
        game.startGame(ip);
    });

    document.getElementById("spectate_button").addEventListener("click", function () {
        let ip = getSelectedServer();
        if (!ip) return true;

        if (ws && ws.address === "ws://" + ip) return true;

        game.startGame(ip, true);
    });

})();