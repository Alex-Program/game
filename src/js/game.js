(function () {
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
                    destroyUnit(command.type, command.id);
                } else if (command.command === "spawn_unit") {
                    addUnit(command.unit, 1);
                } else if (command.command === "mouse_move") {
                    let player = findPlayer(command.id);
                    if (!player) return true;

                    player.mouseMove(command.x, command.y);
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
            if (name === "cell" && gameSettings.isDisableColorAnim) {
                color = this.owner.selectedColor;
            }
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

            } else if (name === "bullet" && !this.isDecreaseMass && gameSettings.isBulletColor) {
                if (!gameSettings.bulletColor) color = "#000000";
                else color = gameSettings.bulletColor;
            } else if (name === "bullet" && this.isDecreaseMass && gameSettings.isDecreaseBulletColor) {
                color = gameSettings.decreaseBulletColor || "#000000";
            }


            // let textColor = rgb.brightness ? "#000000" : "#FFFFFF";
            // let strokeTextColor = rgb.brightness ? "#FFFFFF" : "#000000";

            let textColor = "#FFFFFF";
            let textCellColor = "#FFFFFF";
            if (gameSettings.isCellNickColor && gameSettings.cellNickColor) textCellColor = gameSettings.cellNickColor;
            let strokeTextColor = "#000000";

            if (gameSettings.isShadowColor && gameSettings.shadowColor) shadowColor = gameSettings.shadowColor;

            context.save();

            if (gameSettings.isShadowColor) {
                this.setShadow(shadowColor);
            }

            let radius = this.drawableRadius / gameInfo.scale;
            if (gameSettings.isDrawCellBorder) {
                // radius = this.drawableRadius / gameInfo.scale - 2.5;
                // if (radius < 2) radius = 2;
                this.strokeArc(drawableX, drawableY, radius, toChangeColor(color), 6);
                // radius = this.drawableRadius / gameInfo.scale - 5;
                // if (radius < 2) radius = 2;
                context.restore();
            }
            // let transparent = (name === "food" && imagesArr['food']);
            let transparent = false;
            if (!gameSettings.isDisableTransparentSkin) {
                if (name === "virus" && this.isFeeding && imagesArr['feeding_virus']) transparent = true;
            }


            if (name !== "cell") {
                this.drawArc(drawableX, drawableY, radius, color, transparent);
                context.restore();
            }

            let isDrawText = ((gameSettings.isOptimization && this.drawableRadius / gameInfo.scale > 40) ||
                (!gameSettings.isOptimization && this.drawableRadius / (gameInfo.scale) > 25));

            if (name === "cell") {
                let stickerI = this.owner.stickerI;
                let stickerSet = this.owner.stickersSet;

                if (this.owner.isTransparentSkin && gameSettings.isDrawBorderInvisible && !gameSettings.isDrawCellBorder) {
                    this.strokeArc(drawableX, drawableY, radius, toChangeColor(color), 6);
                    context.restore();
                }

                if (stickerI !== null && stickerI >= 0 && stickerSet && imagesArr[stickerSet[stickerI].image_id]) {

                    this.drawArc(drawableX, drawableY, radius, color, transparent);
                    context.restore();

                    this.drawImage(imagesArr[stickerSet[stickerI].image_id], drawableX, drawableY, radius);
                } else if (imagesArr[this.owner.skinId]) {
                    if (this.owner.isTransparentSkin && !gameSettings.isDisableTransparentSkin) transparent = true;
                    this.drawArc(drawableX, drawableY, radius, color, transparent);
                    context.restore();

                    if (this.owner.isTurningSkin) {
                        this.drawImageByAngle(imagesArr[this.owner.skinId], drawableX, drawableY, this.mouseAngle + 90, this.drawableRadius / gameInfo.scale);
                    } else this.drawImage(imagesArr[this.owner.skinId], drawableX, drawableY, radius);
                } else {
                    this.drawArc(drawableX, drawableY, radius, color, transparent);
                    context.restore();
                }

                if (!gameSettings.isHideNick && isDrawText) {
                    if (!this.owner.isInvisibleNick || gameSettings.isShowInvisibleNick) {
                        if (!isEmpty(this.owner.clan)) {
                            let clanColor = textCellColor;
                            if (gameSettings.isClanCellColor && gameSettings.clanCellColor) clanColor = gameSettings.clanCellColor;
                            let r = this.drawableRadius / (3.5 * gameInfo.scale);
                            let size = Arc.getTextSize(r, this.owner.clan + this.owner.nick);
                            let clanSize = Arc.getTextSize(r, this.owner.clan);
                            let nickSize = Arc.getTextSize(r, this.owner.nick);
                            this.drawText(drawableX - size / 2 + clanSize / 2, drawableY, r, this.owner.clan, clanColor, true, "#000000");
                            this.drawText(drawableX + size / 2 - nickSize / 2, drawableY, r, this.owner.nick, textCellColor, true, strokeTextColor);

                        } else {
                            this.drawText(drawableX, drawableY, this.drawableRadius / (3.5 * gameInfo.scale), this.owner.clan + " " + this.owner.nick, textCellColor, true, strokeTextColor);
                        }
                    }
                }
                drawableY += this.drawableRadius / (2 * gameInfo.scale);
                if (gameSettings.isCellMass && isDrawText) {
                    this.drawText(drawableX, drawableY, this.drawableRadius / (5 * gameInfo.scale), Math.floor(this.mass), textColor);
                }
                return true;
            }

            if (name === "virus") {
                if (!this.isFeeding && imagesArr['virus_arrow']) {
                    let q = (this.mass - 200) / 200;
                    this.drawImageByAngle(imagesArr['virus_arrow'], drawableX, drawableY, -225 + 270 * q, this.drawableRadius / gameInfo.scale);
                } else if (this.isFeeding && imagesArr['feeding_virus']) {
                    this.drawImage(imagesArr['feeding_virus'], drawableX, drawableY, radius);
                }
                let virusMassColor = "#FFFFFF";
                if (gameSettings.isVirusMassColor && gameSettings.virusMassColor) virusMassColor = gameSettings.virusMassColor;
                this.drawText(drawableX, drawableY, this.drawableRadius / (2 * gameInfo.scale), Math.floor(this.mass), virusMassColor);
                return true;
            }


            if (name === "blackhole") {
                if (imagesArr['black_hole']) {
                    this.drawImage(imagesArr['black_hole'], drawableX, drawableY, radius);
                }
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

        strokeArc(x, y, radius, color, strokeWidth) {
            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = strokeWidth;
            context.arc(x, y, radius, 0, 2 * Math.PI, false);
            context.stroke();
            context.closePath();
        }

        drawImage(image, x, y, radius) {
            context.save();
            context.clip();
            context.globalCompositeOperation = "source-atop";
            context.drawImage(image, x - radius, y - radius, radius * 2, radius * 2);
            context.restore();
        }

        drawImageByAngle(image, x, y, angle, radius) {
            context.save();

            context.translate(x, y);
            context.rotate(degreeToRadians(angle));
            context.clip();

            context.globalCompositeOperation = "source-atop";
            context.drawImage(image, -radius, -radius, radius * 2, radius * 2);
            context.restore();
        }

        static getTextSize(size, text) {
            if (+gameSettings.isBigText) size *= 1.8;
            else size *= 1.2;
            if (gameSettings.isOptimization) size /= 1.7;
            let font = gameSettings.isOptimization ? "'Open Sans'" : "'Caveat'";
            context.font = "bold " + String(size) + "px " + font;
            let measure = context.measureText(text);
            return measure.width;
        }

        drawText(x, y, size, value, color = "#FFFFFF", isStroke = false, strokeStyle = "#000000", isShadow = false, shadowColor = "red") {
            if (gameSettings.isBigText) size *= 1.8;
            else if (gameSettings.isSmallText) size /= 1.3;
            else size *= 1.2;
            if (gameSettings.isOptimization) size /= 1.7;

            context.save();

            if (isShadow) {
                this.setShadow(shadowColor);
            }

            let font = gameSettings.isOptimization ? "'Open Sans'" : "'Caveat'";

            context.fillStyle = color;
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = "bold " + String(size) + "px " + font;
            if (gameSettings.isAlphaText) context.globalAlpha = 0.4;
            context.fillText(String(value), x, y);
            if (isStroke) {
                context.lineWidth = size / 50;
                context.strokeStyle = strokeStyle;
                context.strokeText(String(value), x, y);
            }
            context.globalAlpha = 1;
            context.restore();
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

        static drawCenter() {
            let image = isEmpty(dailyTop.skinId) ? imagesArr["center"] : imagesArr[dailyTop.skinId];
            if (!image) return true;

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
            context.drawImage(image, drawableX - gameInfo.centerImageRadius / gameInfo.scale, drawableY - gameInfo.centerImageRadius / gameInfo.scale, gameInfo.centerImageRadius * 2 / gameInfo.scale, gameInfo.centerImageRadius * 2 / gameInfo.scale);
            context.restore();
        }

        static drawGrid() {
            let color = isEmpty(gameSettings.gridColor) ? "#000000" : gameSettings.gridColor;
            context.globalAlpha = 0.3;
            context.strokeStyle = color;
            context.lineWidth = 1;

            context.beginPath();
            let dX = (gameInfo.centerX - canvas.width / 2) % 20;
            for (let x = 20 - dX; x < canvas.width; x += 20) {
                context.moveTo(x, 0);
                context.lineTo(x, canvas.height);

            }

            let dY = (gameInfo.centerY - canvas.height) % 20;
            for (let y = 20 - dY; y < canvas.height; y += 20) {
                context.moveTo(0, y);
                context.lineTo(canvas.width, y);
            }
            context.stroke();
            context.closePath();

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

            rendersArr.push(this);
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

            rendersArr.push(this);

        }

        changePos(virus) {
            this.toMass = virus.mass - this.mass;

            this.cY = this.y;
            this.cX = this.x;
            this.sX = virus.x;
            this.sY = virus.y;
            this.toMass = virus.mass - this.mass;

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

            rendersArr.push(this);
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

        setColor(color) {
            this.color = color;
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
            rendersArr.push(this);
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
        clan = "";

        constructor(x, y, mass, color = "#000000", current = false, id, nick, skin = "", skinId = "", isTransparentSkin = false, isTurningSkin = false, isInvisibleNick = false, clan = "") {
            this.skin = skin;
            this.skinId = skinId;
            this.isTransparentSkin = isTransparentSkin;
            this.isTurningSkin = isTurningSkin;
            this.isInvisibleNick = isInvisibleNick;

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

            this.loadImage();
        }

        setColor(color) {
            this.color = color;
            for (let i = 0; i < this.cells.length; i++) {
                this.cells[i].setColor(color);
            }
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

        setNick(nick, skin, skinId, isTransparentSkin, isTurningSkin, isInvisibleNick, clan = "") {
            this.nick = nick;
            this.skin = skin;
            this.skinId = skinId;
            this.isTransparentSkin = isTransparentSkin;
            this.isTurningSkin = isTurningSkin;
            this.isInvisibleNick = isInvisibleNick;
            this.clan = clan;
            this.loadImage();
        }

        update(delta = 1) {
            if (this.current) {
                if (this.cells.length === 0) {
                    isSpectate = true;
                    return true;
                } else isSpectate = false;
            }

            this.updateI = 0;
            let mass = 0;
            for (; this.updateI < this.cells.length; this.updateI++) {
                this.cells[this.updateI].update(delta);
                try {
                    mass = (mass + this.cells[this.updateI].mass + this.cells[this.updateI].toMass) || mass;
                } catch {
                }
            }
            if (mass > this.totalMass) this.totalMass = mass;
            this.mass = mass;

            const mainCell = this.findMainCell();
            [this.x, this.y] = [mainCell.x, mainCell.y];
        }

        mouseMove(x, y) {
            [this.mouse.x, this.mouse.y] = [x, y];
        }


        changePos(player) {
            this.color = player.color;
            this.score = player.score;
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

        if (!ws) return true;

        ws.sendJson({
            action: "mouse_move",
            x: mouseCoords.x,
            y: mouseCoords.y
        });

    });
    ///////////////


    let gameInfo = {
        centerImageRadius: 100,
        centerX: 0,
        centerY: 0,
        byCenterX: 0,
        byCenterY: 0,
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
        bulletEatenCoefficient: 0.5,
        virus: 10,
        connectTime: 1000,
        maxCell: 64
    };


    loadImage("virus_arrow", "/src/images/virus_arrow1.png");
    loadImage("feeding_virus", "/src/images/feeding_virus.png");
    loadImage("center", "/src/images/logo.png");
    loadImage("food", "/src/images/star.png");
    loadImage("black_hole", "/src/images/black_hole.png");


    let rendersArr = [];
    let bulletsArr = [];
    let virusArr = [];
    let foodsArr = [];
    let blackHoleArr = [];
    let playersArr = [];
    let states = new GameStates();

    let renderVar = null;

    function calcScaleByCell() {
        let player = getCurrentPlayer();
        if (!player) return null;

        return 0.01 * (player.player.cells.length - 1);
    }

    let lastStateTime = 0;
    let differentStateTime = 1;
    let lastStateTimeLocal = 0;

    let isFirstRender = false;


    function getCurrentPlayer() {
        for (let i = 0; i < playersArr.length; i++) {
            let player = playersArr[i];
            if (player.current) return {player, count: i};
        }

        return null;
    }


    function render() {
        new Promise(() => {
            if (performance.now() - gameInfo.updateTime < gameInfo.perSecond) return renderVar = requestAnimationFrame(render);


            gameInfo.deltaTime = performance.now() - gameInfo.updateTime;
            gameInfo.updateTime = performance.now();
            let delta = getTimeByDelta(gameInfo.deltaTime);
            let fps = 1000 / gameInfo.deltaTime;
            if (fps < 15 && !gameSettings.isDisableAutoClear) clearFood();


            if (performance.now() - lastStateTimeLocal >= differentStateTime || true) {
                let newTime = lastStateTime + performance.now() - lastStateTimeLocal - differentStateTime;
                let state = lastStateTime ? states.getStateByTime(newTime) : states.getGameState();


                if (state) {
                    states.executeCommands(lastStateTime);

                    differentStateTime = lastStateTime ? (state.time - newTime) : 0;

                    delta = getTimeByDelta(gameInfo.deltaTime);
                    lastStateTime = state.time;
                    lastStateTimeLocal = performance.now();


                    for (let i = 0; i < state.players.length; i++) {
                        let sPlayer = state.players[i];
                        if (!isFirstRender) delta = 1;

                        let player = findPlayer(sPlayer.id);
                        if (!player) continue;
                        player.changePos(sPlayer);
                    }

                    for (let i = 0; i < state.virus.length; i++) {
                        let sVirus = state.virus[i];
                        let virus = findVirus(sVirus.id);
                        if (!virus) continue;
                        virus.virus.changePos(sVirus);
                    }

                    for (let i = 0; i < state.blackHole.length; i++) {
                        let sBlackHole = state.blackHole[i];
                        let blackHole = findBlackHole(sBlackHole.id);
                        if (!blackHole) continue;
                        blackHole.blackHole.changePos(sBlackHole);
                    }
                }
            }

            context.clearRect(0, 0, canvas.width, canvas.height);
            let filter = "";
            if (gameSettings.isGrayscale) filter += "grayscale(100%)";
            if (gameSettings.isInvertColor) filter += " invert(100%)";
            if (gameSettings.isBrigthness) filter += " brightness(150%)";
            if (gameSettings.isSepia) filter += " sepia(100%)";
            context.filter = filter || "none";

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

            rendersArr = [];

            for (let i = 0; i < playersArr.length; i++) {
                playersArr[i].update(delta);
            }

            for (let i = 0; i < bulletsArr.length; i++) {
                bulletsArr[i].update(delta);
            }

            for (let i = 0; i < virusArr.length; i++) {
                virusArr[i].update(delta);
            }

            for (let i = 0; i < blackHoleArr.length; i++) {
                blackHoleArr[i].update();
            }

            if (gameSettings.isGrid) {
                Arc.drawGrid();
            }
            Arc.drawCenter();

            for (let i = 0; i < foodsArr.length; i++) {
                foodsArr[i].render();
            }

            rendersArr = rendersArr.sort((a, b) => a.drawableRadius - b.drawableRadius);
            let renderLength = rendersArr.length;
            for (let i = 0; i < renderLength; i += 2) {
                rendersArr[i].render();
                try {
                    rendersArr[i + 1].render();
                } catch (e) {
                }

            }


            // Arc.drawCompass();

            isFirstRender = true;

            renderVar = requestAnimationFrame(render);
        });


    }


    let coordsHtml = $("#coords");
    let lastFpsUpdate = 0;
    let fps = $("#coords .fps .value");

    function updateHtml() {
        let player = getCurrentPlayer();

        if (player) {
            for (let [key, value] of Object.entries([player.player.cells.length, Math.floor(player.player.mass), "x: " + Math.floor(gameInfo.centerX * 10) + " y: " + Math.floor(gameInfo.centerY * 10)])) {
                coordsHtml.find(".value:eq(" + key + ")").text(value);
            }
        }
        if (performance.now() - lastFpsUpdate > 1000 && gameInfo.deltaTime) {
            fps.text(Math.round(1000 / gameInfo.deltaTime));
            lastFpsUpdate = performance.now();
        }
        requestAnimationFrame(updateHtml);
    }


    let allPlayersTimeout = null;

    function getAllPlayers() {
        if (!isAdmin && !isModer) return true;

        let html = "";
        for (let i = 0; i < playersArr.length; i++) {
            let player = playersArr[i];
            html += "<div class='flex_row player' data-id='" + player.id + "'><span class='id'>" + player.id + "</span><span class='nick' style='color: " + player.selectedColor + ";'>" + player.nick + "</span><span class='mass'>" + Math.floor(player.mass) + "</span></div>";
        }
        $("#players_for_admin .data").html(html);

        allPlayersTimeout = setTimeout(getAllPlayers, 2000);
    }

    if (isAdmin || isModer) {
        allPlayersTimeout = setTimeout(getAllPlayers, 2000);
    }

    function getUnit(unit) {
        let returned = null;
        if (typeof (unit) === "string") unit = unit.split(",");
        let name = Array.isArray(unit) ? unit[0] : unit.n;

        if (name === "p") {
            let current = unit.cr === "t";
            let player = new Player(0, 0, 0, unit.cl, current, unit.id, unit.nick, "", "", Boolean(+unit.its), Boolean(+unit.itrs), Boolean(+unit.iin), unit.cn);
            player.mouse.x = unit.x;
            player.mouse.y = unit.y;
            player.skin = unit.skin;
            player.skinId = unit.skinId;
            player.stickersSet = null;
            if (!isEmpty(unit.stickersSet)) player.loadStickers(unit.stickersSet);
            player.stickerI = isEmpty(unit.stickerI) ? null : unit.stickerI;
            player.selectedColor = unit.s;
            player.score = unit.sc;

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
        }

        return returned;
    }

    function addUnit(unit, delta = 1) {
        let name = unit.constructor.name.toLowerCase();
        if (name === "player") {
            let currentPlayer = getCurrentPlayer();
            if (playersArr.length > 0 && currentPlayer && +currentPlayer.player.id === unit.id) return true;

            unit.loadImage();
            if (unit.current) {
                if (currentPlayer) return true;
                playersArr.unshift(unit);
                playersArr[0].update(delta);

                ws.sendJson({action: "update_units"});
                ws.sendJson({action: "get_all_units"});
                // setTimeout(function () {
                //     ws.sendJson({
                //         action: "mouse_move",
                //         x: playersArr[0].mouse.x,
                //         y: playersArr[0].mouse.y
                //     });
                // }, 1000);
                setTimeout(function () {
                    gameInfo.updateTime = performance.now();
                    render();
                    updateHtml();
                    getTopPlayers();
                    isGame = true;
                }, 10);
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

        if (name === "blackhole") {
            blackHoleArr.push(unit);
            return true;
        }

    }


    function getTopPlayers() {
        let arr = playersArr.sort((a, b) => b.score - a.score);
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
        setTimeout(getTopPlayers, 2000);
    }

    function destroyUnit(type, id) {
        let arr = [];
        if (type === "virus") arr = virusArr;
        else if (type === "food") arr = foodsArr;
        else if (type === "bullet") arr = bulletsArr;
        else if (type === "player") arr = playersArr;

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
        $(this).blur();
    });

    document.addEventListener("keypress", function (event) {
        if (event.code.toLowerCase() === "enter") $("#message_text").focus();
    });


    function clearFood() {
        for (let i = 0; i < foodsArr.length; i++) {
            foodsArr[i].clear();
        }
        for (let i = 0; i < bulletsArr.length; i++) {
            bulletsArr[i].clear();
        }
    }

    let lastKeyPressTime = {};

    let preventDefault = ["tab"];
    let keyPressed = [];
    let isSticker = false;
    window.addEventListener("keydown", function (event) {
        let code = event.code.toLowerCase();
        if (code in lastKeyPressTime) {
            if (performance.now() - lastKeyPressTime[code] < 100) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
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


        if (["digit1", "digit2", "digit3", "digit4", "digit5", "digit6", "digit7", "digit8", "digit9"].includes(code)) {
            if (isSticker) {
                keyPressed.splice(keyPressed.indexOf(code), 1);
                return true;
            }
            if (!ws) return true;

            let player = getCurrentPlayer();
            if (!player) return true;

            isSticker = true;
            let stickerNumber = +code.substr(-1) - 1;
            playersArr[player.count].stickerI = stickerNumber;

            ws.sendJson({
                action: "select_sticker",
                number: stickerNumber
            });
            return true;
        }
    });
    window.addEventListener("keyup", function (event) {
        let code = event.code.toLowerCase();
        if (preventDefault.includes(code)) event.preventDefault();

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
            let player = getCurrentPlayer();
            if (!player) return true;

            playersArr[player.count].stickerI = null;
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

        if (ws && ws.address === "ws://" + ip) {
            if (isSpectate) {
                ws.sendJson({
                    action: "respawn_player"
                });
                isSpectate = false;
            }
            changeNick($("#nick_for_game").val().trim(), $("#password_for_game").val().trim(), $("#clan_for_game").val().trim());
            return true;
        }
        startGame(ip);
    });

    document.getElementById("spectate_button").addEventListener("click", function () {
        let ip = getSelectedServer();
        if (!ip) return true;

        if (ws && ws.address === "ws://" + ip) return true;

        startGame(ip, true);
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

    /**
     * @param id number
     * @return {null|{count: number, virus: Virus}}
     */
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


    function findBlackHole(id) {
        id = +id;
        let count = 0;
        let blackHole = null;
        for (let i = 0; i < blackHoleArr.length; i++) {
            if (+blackHoleArr[i].id === id) {
                blackHole = blackHoleArr[i];
                count = i;
                break;
            }
        }

        if (!blackHole) return null;
        return {blackHole, count};
    }

    let ping = $("#coords .ping .value");
    let startPingTime = 0;


    /// spectator
    $("body").on("click", function (e) {
        if (!isSpectate) return true;

        gameInfo.byCenterX = e.clientX - canvas.width / 2;
        gameInfo.byCenterY = e.clientY - canvas.height / 2;
    });


    function startGame(ip, spect = false) {
        isSpectate = spect;
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
                clan: $("#clan_for_game").val().trim().substr(0, 15) || "",
                nick: $("#nick_for_game").val().trim().substr(0, 15) || "SandL",
                password: $("#password_for_game").val().trim(),
                color: $("#select_color").val(),
                token: getCookie("Token") || "",
                userId: getCookie("User-Id") || "",
                type: spect ? "spectator" : "player"
            });
            startPingTime = performance.now();
            ws.sendJson({action: "ping"});

        });
        ws.on("message", function (event) {
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
                for (let i = 0; i < data.u.length; i++) {
                    let unit = getUnit(data.u[i]);
                    let name = unit.constructor.name.toLowerCase();
                    if (name === "player") players.push(unit);
                    else if (name === "virus") virus.push(unit);
                    else if (name === "blackhole") blackHole.push(unit);
                }

                // states.removeFirstState();
                states.addGameState({time: data.time, players, virus, blackHole});
                if (lastStateTime) {
                    states.removeBeforeState(lastStateTime + performance.now() - lastStateTimeLocal - differentStateTime);
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
                let unit = getUnit(data.unit);

                if (!isGame) addUnit(unit, 1);
                else states.addGameCommand({time: data.time, command: "spawn_unit", unit});


                return true;
            }

            if (data.action === "get_all_units") {
                let arr = data.u;
                let length = arr.length;

                for (let i = 0; i < length; i++) {
                    let unit = getUnit(arr[i]);
                    addUnit(unit);
                }

                return true;
            }

            if (data.action === "player_disconnect") {

                for (let i = 0; i < playersArr.length; i++) {
                    if (+playersArr[i].id !== +data.id) continue;
                    playersArr.splice(i, 1);
                    break;
                }

                return true;
            }

            if (data.action === "chat_message") {
                Message.getNewMessage(data);
                return true;
            }

            if (data.action === "ping") {
                let delta = performance.now() - startPingTime;
                ping.text(Math.round(delta / 2));

                setTimeout(function () {
                    startPingTime = performance.now();
                    ws.sendJson({action: "ping"});
                }, 1000);
                return true;
            }

            if (data.action === "nick_info") {
                isAdmin = +data.is_admin;
                isModer = +data.is_moder;
                try {
                    clearTimeout(allPlayersTimeout);
                } catch {
                }
                onNickInfo();
                if (isAdmin || isModer) {
                    allPlayersTimeout = setTimeout(getAllPlayers, 2000);
                }
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

                player.setNick(data.nick, data.skin, data.skinId, Boolean(+data.isTransparentSkin), Boolean(+data.isTurningSkin), Boolean(+data.isInvisibleNick), data.clan);

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
                states.addGameCommand({time: data.time, type: data.type, id: data.id, command: "destroy_unit"});
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
    }

})();