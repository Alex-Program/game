const Functions = require('../functions.js');
const {Performance: performance} = require("./Perfromance.js");

let gameInfo = {
    width: 2500,
    height: 2500,
    startMass: 5000,
    updateTime: 0,
    deltaTime: 0,
    perSecond: 1000 / 60,
    food: 1500,
    foodMinMass: 5,
    foodMaxMass: 50,
    virus: 100,
    virusStartMass: 200,
    bulletMass: 25,
    bulletEatenCoefficient: 0.7,
    connectTime: 1000,
    connectTimeMassCoefficient: 0.1,
    maxCells: 64,
    maxCellMass: 100000,
    botsCount: 0,
    feedingVirusCount: 1,
    feedingVirusStartMass: 400,
    feedingVirusMaxMass: 5000,
    feedingVirusInterval: 1000,
    feedingVirusIntervalCoefficient: 0.01,
    feedingVirusShootCoefficient: 0.1
};

/// nick => {password, skin, skin_id, is_transparent_skin}
let cachedNicks = {};

function clearCachedNicks() {
    cachedNicks = {};
    setTimeout(clearCachedNicks, 300000);
}

clearCachedNicks();


let dailyTop = {
    mass: "",
    nick: "",
    skin: "",
    skinId: ""
};

class Arc {

    constructor() {
    }

    get drawableRadius() {
        return Math.sqrt(this.mass / Math.PI) * 3;
    }

    static getDrawableRadius(mass) {
        return Math.sqrt(mass / Math.PI) * 3;
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

    static outOfBorder(x, y) {
        return (x <= 0 || x >= gameInfo.width || y <= 0 || y >= gameInfo.height);
    }

    destroy() {
        game.onDestroyUnit(this.constructor.name.toLowerCase(), this.id);
    }

}


let Food = exports.Food = class Food extends Arc {

    constructor(x, y, mass, color) {
        super();

        this.id = ++game.foodId;
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.toMass = 0;
        this.color = color;

        game.onSpawnUnit(this);
    }

    update() {
    }

};

class Bullet extends Arc {

    constructor(x, y, sin, cos, mass, distance, color = "#ff0400", fromFeedingVirus = false) {
        super();

        this.id = ++game.bulletId;
        this.x = x;
        this.y = y;
        this.sin = sin;
        this.cos = cos;
        this.mass = mass;
        this.distance = distance;
        this.color = color;
        this.fromFeedingVirus = fromFeedingVirus;

        game.onSpawnUnit(this);
    }

    update() {

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
            let speed = this.distance * this.timeRatio / 23;
            if (speed < 1) speed = 1;
            if (this.distance < speed) speed = this.distance;

            this.x = Functions.roundFloor(this.x + speed * this.cos, 2);
            this.y = Functions.roundFloor(this.y + speed * this.sin, 2);

            if (this.x < 0) this.x = 0;
            else if (this.x > gameInfo.width) this.x = gameInfo.width;

            if (this.y < 0) this.y = 0;
            else if (this.y > gameInfo.height) this.y = gameInfo.height;

            this.distance = Functions.roundFloor(this.distance - speed, 2);
        }

    }

}

class Virus extends Arc {

    constructor(x, y, sin, cos, distance = 0, mass = gameInfo.virusStartMass, color = "#fff500", isFeeding = false) {
        super();

        this.id = ++game.virusId;
        this.x = x;
        this.y = y;
        this.sin = sin;
        this.cos = cos;
        this.distance = distance;
        this.mass = mass;
        this.toMass = 0;
        this.color = color;
        this.isChanged = false;
        this.isFeeding = isFeeding;
        this.lastShootTime = performance.now();

        game.onSpawnUnit(this);
    }

    update() {

        if (this.x <= 0 || this.x >= gameInfo.width) {
            this.cos = -this.cos;
            this.isChanged = true;
        }
        if (this.y <= 0 || this.y >= gameInfo.height) {
            this.sin = -this.sin;
            this.isChanged = true;
        }

        if (Math.abs(this.toMass) > 0) {
            let speed = this.toMass * this.timeRatio / 5;
            if (Math.abs(speed) < 1) speed = this.toMass >= 0 ? 1 : -1;
            if (Math.abs(this.toMass) < Math.abs(speed)) speed = this.toMass;

            this.mass = Math.round(this.mass + speed);
            this.toMass = Math.round(this.toMass - speed);

            if (!this.isFeeding) {
                if (this.mass > 400) {
                    this.mass = 400;
                    this.toMass = -gameInfo.virusStartMass;
                    game.virusArr.push(
                        new Virus(this.x, this.y, this.sin, this.cos, 200)
                    );
                }
            } else {
                if (this.mass >= gameInfo.feedingVirusMaxMass) {
                    this.mass = gameInfo.feedingVirusMaxMass;
                    this.toMass = 0;
                } else if (this.mass <= gameInfo.feedingVirusStartMass) {
                    this.toMass = 0;
                    this.mass = gameInfo.feedingVirusStartMass;
                }
            }
            this.isChanged = true;
        }

        if (this.distance > 0) {
            let speed = this.distance * this.timeRatio / 20;
            if (speed < 1) speed = 1;
            if (this.distance < speed) speed = this.distance;

            this.x = Functions.roundFloor(this.x + speed * this.cos, 2);
            this.y = Functions.roundFloor(this.y + speed * this.sin, 2);

            if (this.x < 0) this.x = 0;
            else if (this.x > gameInfo.width) this.x = gameInfo.width;

            if (this.y < 0) this.y = 0;
            else if (this.y > gameInfo.height) this.y = gameInfo.height;

            this.distance = Functions.roundFloor(this.distance - speed, 2);
            this.isChanged = true;
        }


        for (let i = 0; i < game.bulletsArr.length; i++) {
            let bullet = game.bulletsArr[i];
            if (bullet.fromFeedingVirus) continue;

            let c = Math.sqrt((this.x - bullet.x) ** 2 + (this.y - bullet.y) ** 2);
            if (c > this.drawableRadius + bullet.drawableRadius) continue;

            this.toMass += bullet.mass;

            bullet.destroy();
            game.bulletsArr.splice(i, 1);
            i--;

            if (bullet.distance > 0) {
                this.sin = bullet.sin;
                this.cos = bullet.cos;
            }
            this.isChanged = true;
        }

        if (this.isFeeding) {
            if (performance.now() - this.lastShootTime > gameInfo.feedingVirusInterval / (this.mass * gameInfo.feedingVirusIntervalCoefficient)) {
                let angle = Functions.getRandomInt(0, 360);
                angle *= Math.PI / 180;
                let sin = Math.sin(angle);
                let cos = Math.cos(angle);
                let mass = Functions.getRandomInt(gameInfo.foodMinMass * 1.5, gameInfo.foodMaxMass * 1.5);
                let c = this.drawableRadius + Arc.getDrawableRadius(mass) + 3;
                let bullet = new Bullet(this.x + c * cos, this.y + c * sin, sin, cos, mass, Functions.getRandomInt(5, 30), Functions.getRandomColor(), true);

                game.bulletsArr.push(bullet);
                this.toMass -= gameInfo.bulletMass * gameInfo.feedingVirusShootCoefficient;

                this.lastShootTime = performance.now();
            }
        }


    }

}

class Cell extends Arc {

    constructor(x, y, mass, sin, cos, main = false, color = "#000000", owner, id, spaceDistance = 0) {
        super();

        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
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
        this.isCollising = true;
        this.lastDecreaseTime = performance.now();
        this.owner.isChanged = true;
        setTimeout(() => {
            this.isConnect = true;
            this.owner.isChanged = true;
        }, gameInfo.connectTime + this.mass * gameInfo.connectTimeMassCoefficient);

        this.updateDirection();

    }


    update(delta = 1) {
        this.updateDirection();

        let speed = Math.min(this.mouseDist, this.speed);

        if (performance.now() - this.lastDecreaseTime > 3000 && this.mass > 200) {
            this.toMass -= this.mass / 100;
            this.lastDecreaseTime = performance.now();
            this.owner.isChanged = true;
        }

        if (this.spaceDistance === 0) {
            this.x = Functions.roundFloor(this.x + this.cos * speed * delta, 2);
            this.y = Functions.roundFloor(this.y + this.sin * speed * delta, 2);
        }

        if (Math.abs(this.toMass) > 0) {
            let speed = this.toMass * delta / 5;
            if (Math.abs(speed) < 1) speed = this.toMass >= 0 ? 1 : -1;
            if (Math.abs(this.toMass) < Math.abs(speed)) speed = this.toMass;

            this.mass = Math.round(this.mass + speed);
            this.toMass = Math.round(this.toMass - speed);
            if (this.mass >= gameInfo.maxCellMass) {
                this.mass = gameInfo.maxCellMass;
                this.toMass = 0;
            }
            if (this.mass <= 0) {
                this.owner.cells.splice(this.owner.updateI, 1);
                this.owner.updateI--;
                return true;
            }
        }

        if (Math.abs(this.spaceDistance > 0)) {
            if (this.spaceDistance <= this.totalSpaceDistane / 1.3) this.isCollising = true;
            let speed = this.spaceDistance * delta / 15;
            if (Math.abs(speed) < 1) speed = this.spaceDistance >= 0 ? 1 : -1;
            // if (Math.abs(speed) > 10) speed = this.spaceDistance >= 0 ? 10 : -10;
            if (Math.abs(this.spaceDistance) < Math.abs(speed)) speed = this.spaceDistance;

            this.x = Functions.roundFloor(this.x + speed * this.spaceCos * this.speed, 2);
            this.y = Functions.roundFloor(this.y + speed * this.spaceSin * this.speed, 2);
            this.spaceDistance = Functions.roundFloor(this.spaceDistance - speed, 2);
        }

        if (Math.abs(this.engineDistance > 0)) {
            let speed = this.engineDistance * delta / 15;
            if (Math.abs(speed) < 1) speed = this.engineDistance >= 0 ? 1 : -1;
            // if (Math.abs(speed) > 30) speed = this.engineDistance >= 0 ? 30 : -30;
            if (Math.abs(this.engineDistance) < Math.abs(speed)) speed = this.engineDistance;

            this.x = Functions.roundFloor(this.x + speed * this.engineCos * this.speed, 2);
            this.y = Functions.roundFloor(this.y + speed * this.engineSin * this.speed, 2);
            this.engineDistance = Functions.roundFloor(this.engineDistance - speed, 2);
        }

        if (this.spaceDistance <= this.totalSpaceDistane / 2) {
            for (let i = 0; i < game.virusArr.length; i++) {

                let virus = game.virusArr[i];
                if (this.mass < virus.mass * 1.5) continue;

                let c = Math.sqrt((this.x - virus.x) ** 2 + (this.y - virus.y) ** 2);


                if (c > this.drawableRadius - 0.5 * virus.drawableRadius) continue;

                this.toMass += virus.mass;
                let count = Math.min(Math.floor((this.mass / 2) / 50), gameInfo.maxCells - this.owner.cells.length);
                let mass = Math.floor((this.mass / 2) / count);
                let angleStep = 180 / count;
                let angle = Functions.getAngle(this.sin, this.cos);

                this.isCollising = true;

                let currentAngle = angle.degree - 90;

                if (count > 0) this.toMass -= this.mass / 2;

                while (count > 0) {
                    let sin = Math.sin(Functions.degreeToRadians(currentAngle));
                    let cos = Math.cos(Functions.degreeToRadians(currentAngle));

                    let distance = this.radius + mass / 10 + 5;
                    this.owner.cells.push(
                        new Cell(this.x + distance * cos, this.y + distance * sin, mass, sin, cos, false, this.color, this.owner, ++this.owner.cellId, 50)
                    );
                    currentAngle += angleStep;
                    count--;
                }


                virus.destroy();
                game.virusArr.splice(i, 1);
                i--;

                this.owner.isChanged = true;
            }

            for (let i = 0; i < game.virusFeedingArr.length; i++) {
                let virus = game.virusFeedingArr[i];
                if (this.mass < virus.mass * 1.5 && this.mass * 1.25 > virus.mass) continue;

                let c = Math.sqrt((this.x - virus.x) ** 2 + (this.y - virus.y) ** 2);

                if (this.mass * 1.25 <= virus.mass) {
                    if (c > virus.drawableRadius - 0.5 * this.drawableRadius) continue;

                    virus.toMass += this.mass;
                    let updateI = game.playersArr[game.updatePlayerI].updateI;
                    game.playersArr[game.updatePlayerI].cells.splice(updateI, 1);

                    game.playersArr[game.updatePlayerI].updateI--;

                    if (game.playersArr[game.updatePlayerI].cells.length === 0) {
                        game.playersArr[game.updatePlayerI].destroy();
                        if (game.playersArr[game.updatePlayerI].type === "bot") {
                            game.playersArr.splice(game.updatePlayerI, 1);
                            game.updatePlayerI--;
                        }
                        return true;
                    }
                    if (this.main) game.playersArr[game.updatePlayerI].cells[0].main = true;
                    return true;
                }


                if (c > this.drawableRadius - 0.5 * virus.drawableRadius) continue;

                this.toMass += virus.mass;
                let count = Math.min(Math.floor((this.mass / 2) / 50), gameInfo.maxCells - this.owner.cells.length);
                let mass = Math.floor((this.mass / 2) / count);
                let angleStep = 180 / count;
                let angle = Functions.getAngle(this.sin, this.cos);

                this.isCollising = true;

                let currentAngle = angle.degree - 90;

                if (count > 0) this.toMass -= this.mass / 2;

                while (count > 0) {
                    let sin = Math.sin(Functions.degreeToRadians(currentAngle));
                    let cos = Math.cos(Functions.degreeToRadians(currentAngle));

                    let distance = this.radius + mass / 10 + 5;
                    this.owner.cells.push(
                        new Cell(this.x + distance * cos, this.y + distance * sin, mass, sin, cos, false, this.color, this.owner, ++this.owner.cellId, 50)
                    );
                    currentAngle += angleStep;
                    count--;
                }


                virus.destroy();
                game.virusFeedingArr.splice(i, 1);
                i--;

                this.owner.isChanged = true;

            }

        }

        if (this.isCollising) {
            for (let i = 0; i < game.bulletsArr.length; i++) {
                let bullet = game.bulletsArr[i];
                let c = Math.sqrt((this.x - bullet.x) ** 2 + (this.y - bullet.y) ** 2);
                if (this.drawableRadius >= c) {
                    this.toMass += bullet.mass * gameInfo.bulletEatenCoefficient;

                    bullet.destroy();
                    game.bulletsArr.splice(i, 1);
                    i--;
                    this.owner.isChanged = true;
                }
            }


            for (let i = 0; i < game.foodsArr.length; i++) {
                let food = game.foodsArr[i];
                let c = Math.sqrt((this.x - food.x) ** 2 + (this.y - food.y) ** 2);
                if (c > this.drawableRadius + food.drawableRadius + 1) continue;

                this.toMass += food.mass;

                food.destroy();
                game.foodsArr.splice(i, 1);
                i--;
                this.owner.isChanged = true;
            }

        }

        if (this.x < 0) this.x = 0;
        else if (this.x > gameInfo.width) this.x = gameInfo.width;

        if (this.y < 0) this.y = 0;
        else if (this.y > gameInfo.height) this.y = gameInfo.height;

        // this.engineSin = 0;
        // this.engineCos = 0;
        if (this.x <= 0 || this.x >= gameInfo.width) {
            this.engineCos = -this.cos;
            this.engineDistance = this.x <= 0 ? -this.x : this.x - gameInfo.width;
        }
        if (this.y <= 0 || this.y >= gameInfo.height) {
            this.engineSin = -this.sin;
            this.engineDistance = this.y <= 0 ? -this.y : this.y - gameInfo.height;
        }


        for (let p = 0; p < game.playersArr.length; p++) {
            if (!game.playersArr[p].isSpawned) continue;
            for (let i = 0; i < game.playersArr[p].cells.length; i++) {

                let cell = game.playersArr[p].cells[i];
                if (cell.id === this.id && this.owner.wsId === game.playersArr[p].wsId) continue;
                // if (this.mass < cell.mass) continue;
                let distance = Functions.roundFloor(Math.sqrt((cell.x - this.x) ** 2 + (cell.y - this.y) ** 2), 2);

                if (this.owner.wsId === game.playersArr[p].wsId) {

                    if (!cell.isCollising || !this.isCollising) continue;

                    let different = Functions.roundFloor(this.drawableRadius + cell.drawableRadius - distance, 2);

                    if (different > 0 && (!this.isConnect || !cell.isConnect)) {
                        let differentX = this.x - cell.x;
                        let differentY = this.y - cell.y;
                        let c = Math.sqrt(differentX ** 2 + differentY ** 2);
                        //
                        // if (this.spaceDistance > 0 || cell.spaceDistance > 0 || this.engineDistance > 0 || cell.engineDistance > 0) {
                        this.engineCos = differentX / c || 0;
                        this.engineSin = differentY / c || 0;
                        this.engineDistance = different;
                        // } else {
                        //     this.x = Functions.roundFloor(this.x + cos * different, 2);
                        //     this.y = Functions.roundFloor(this.y + sin * different, 2);
                        // }
                        this.owner.isChanged = true;
                        // let cos = differentX / c || 0;
                        // let sin = differentY / c || 0;

                        // this.x = roundFloor(this.x + different * cos, 2);
                        // this.y = roundFloor(this.y + different * sin, 2)
                    }

                    if (Math.abs(this.spaceDistance) > 0 || this.mass < cell.mass || !this.isConnect || !cell.isConnect) continue;

                    if (distance <= Functions.roundFloor(this.drawableRadius - cell.drawableRadius / 2, 2)) {
                        this.toMass = Functions.roundFloor(this.toMass + cell.mass, 2);
                        this.main = cell.main || this.main;
                        this.owner.cells.splice(i, 1);
                        if (this.owner.updateI > i) {
                            i--;
                            this.owner.updateI--;
                        }
                        this.owner.isChanged = true;
                        // this.isConnect = false;
                        // setTimeout(() => this.isConnect = true, 100);
                    }

                    continue;
                }

                if (this.mass < 1.25 * cell.mass) continue;
                if (distance > Functions.roundFloor(this.drawableRadius - cell.drawableRadius / 2, 2)) continue;
                game.playersArr[p].isChanged = true;
                this.owner.isChanged = true;

                this.toMass = Functions.roundFloor(this.toMass + cell.mass, 2);
                game.playersArr[p].cells.splice(i, 1);
                i--;

                if (game.playersArr[p].updateI >= i) {
                    game.playersArr[p].updateI--;
                }
                if (game.playersArr[p].cells.length === 0) {
                    game.playersArr[p].destroy();
                    if (game.playersArr[p].type === "bot") {
                        game.playersArr.splice(p, 1);
                        p--;

                        if (p <= game.updatePlayerI) game.updatePlayerI--;
                    }
                    break;
                }
                if (cell.main) game.playersArr[p].cells[0].main = true;

            }
        }

        this.updateCoords();
    }

    updateDirection() {

        let differentX = this.owner.mouse.x - this.x;
        let differentY = this.owner.mouse.y - this.y;

        if (Math.abs(differentY) < 1) differentY = 0;
        if (Math.abs(differentX) < 1) differentX = 0;

        let c = Math.sqrt(differentX ** 2 + differentY ** 2);
        this.sin = Functions.roundFloor(differentY / c, 2) || -1;
        this.cos = Functions.roundFloor(differentX / c, 2) || 0;
    }

    updateCoords() {
        if (!this.main) return true;

        let differentX = this.x - this.prevX;
        let differentY = this.y - this.prevY;
        let distance = Math.sqrt(differentX ** 2 + differentY ** 2);

        let sin = differentY / distance || 0;
        let cos = differentX / distance || 0;

        let speed = distance / 10;
        if (Math.abs(speed) < 1) speed = distance >= 0 ? 1 : -1;
        if (Math.abs(distance) < Math.abs(speed)) speed = distance;

        let height = speed * sin;
        let width = speed * cos;
        this.owner.mouse.x = Functions.roundFloor(this.owner.mouse.x + width, 2);
        this.owner.mouse.y = Functions.roundFloor(this.owner.mouse.y + height, 2);
        [this.prevX, this.prevY] = [this.x, this.y];
    }


    split() {
        this.isCollising = true;
        let mass = this.mass + this.toMass;
        if (this.owner.cells.length === gameInfo.maxCells || mass <= 250) return true;

        let speed = Math.min(this.mouseDist, this.speed);

        this.x = Functions.roundFloor(this.x - this.cos * speed, 2);
        this.y = Functions.roundFloor(this.y - this.sin * speed, 2);

        this.isConnect = false;
        setTimeout(() => this.isConnect = true, gameInfo.connectTime + this.mass * gameInfo.connectTimeMassCoefficient);

        let height = this.radius * this.sin * 1.1;
        let width = this.radius * this.cos * 1.1;

        this.toMass = Math.floor(this.toMass - mass / 2);

        let distance = 50000 / mass + mass / 10;

        let c = new Cell(Functions.roundFloor(this.x + width, 2), Functions.roundFloor(this.y + height, 2), mass / 2, this.sin, this.cos, false, this.color, this.owner, ++this.owner.cellId, distance);
        c.isCollising = false;
        this.owner.cells.push(c);

    }


    shoot() {
        if (this.mass + this.toMass <= 70) return true;

        game.bulletsArr.push(
            new Bullet(this.x + (this.radius + 5) * this.cos, this.y + (this.radius + 5) * this.sin, this.sin, this.cos, gameInfo.bulletMass, 100, this.color, false)
        );
        this.toMass -= gameInfo.bulletMass;
    }

    breakCell() {
        let count = Math.floor((this.mass - 100) / gameInfo.bulletMass);

        for (let i = 0; i < count; i++) {
            this.toMass -= gameInfo.bulletMass;
            let rand = this.getRandomInRound(100, Arc.getDrawableRadius(gameInfo.bulletMass) + 5);
            game.bulletsArr.push(
                new Bullet(rand.x, rand.y, 0, 0, gameInfo.bulletMass, 0, "#ff0400", false)
            );
        }
        this.owner.isChanged = true;
    }

    getRandomInRound(radius = 300, distance = 0) {
        let minX = this.x - this.drawableRadius - radius;
        let maxX = this.x + this.drawableRadius + radius;
        let minY = this.y - this.drawableRadius - radius;
        let maxY = this.y + this.drawableRadius + radius;
        let x = Functions.getRandomInt(minX, maxX);
        let y = Functions.getRandomInt(minY, maxY);
        if ((this.x - x) ** 2 + (this.y - y) ** 2 <= (this.drawableRadius + distance) ** 2 || Arc.outOfBorder(x, y)) return this.getRandomInRound(radius, distance);
        return {x, y};
    }

}

class Player {

    constructor(wsId, x, y, mass, mouseX, mouseY, color = "#000000", nick, password = "", token = "", userId = "", type = "player", isSpectator, isTransparentSkin = false, isTurningSkin = false, isInvisibleNick = false, isRandomColor = false) {
        this.type = type;
        this.nick = nick;
        this.password = password;
        this.skin = "";
        this.skinId = 0;
        this.isTransparentSkin = isTransparentSkin;
        this.isTurningSkin = isTurningSkin;
        this.isInvisibleNick = isInvisibleNick;
        this.isRandomColor = true;
        this.lastRandomColor = performance.now();

        this.isVerified = false;
        this.mouse = {
            x: mouseX,
            y: mouseY
        };
        this.cellId = 0;
        if (!isSpectator) {
            this.cells = [
                new Cell(x, y, mass, 0, 0, true, color, this, 0, 0)
            ];
        } else this.cells = [];

        this.updateI = 0;
        this.wsId = wsId;
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.color = color;
        this.toColor = color;
        this.isAdmin = false;
        this.isModer = false;
        this.mass = 0;
        this.totalMass = 0;
        this.toMass = 0;
        this.isBreak = false;
        this.token = token;
        this.userId = userId;
        this.account = null;
        this.stickersSet = null;
        this.stickerI = null;
        this.lastShootTime = performance.now();
        this.isChanged = true;
        this.isSpawned = false;
        // this.lastUpdateUnitsTime = performance.now();
        this.isSpectator = isSpectator;
        this.isNeedSplit = false;
        this.isNeedShoot = false;
        this.isDisconnect = false;

        this.main();
    }

    async main() {
        await this.authNick();
        await this.authAccount();

        try {
            if (!this.isSpectator) {
                this.cells[0].updateDirection();
            }
            this.isSpawned = !this.isSpectator;
            game.onSpawnUnit(this);
        } catch (e) {
        }

    }

    async authAccount() {
        if (Functions.isEmpty(this.token) || Functions.isEmpty(this.userId)) return false;
        await Functions.sendRequest("api/admin", {action: "get_account_info", token: this.token, userId: this.userId})
            .then(data => {
                if (data.result !== "true") {
                    this.account = null;
                } else if (+data.data.is_banned) {
                    this.account = null;
                } else this.account = data.data;
                this.isChanged = true;
                return true;
            });
    }

    changeAccount(userId, token) {
        this.account = null;
        this.userId = userId;
        this.token = token;
        this.authAccount();
    }

    async getNickInfo() {
        let data = await Functions.sendRequest("api/admin", {action: "get_nick", nick: this.nick});
        if (data.result === "true") return data.data;
        if (data.data === "invalid_data") return false;
    }

    async authNick() {
        let nickInfo = this.nick.toLowerCase() in cachedNicks ? cachedNicks[this.nick.toLowerCase()] : await this.getNickInfo();
        if (nickInfo) {
            if (!(nickInfo.nick.toLowerCase() in cachedNicks)) {
                cachedNicks[nickInfo.nick.toLowerCase()] = {
                    nick: nickInfo.nick.toLowerCase(),
                    password: nickInfo.password,
                    is_moder: +nickInfo.is_moder,
                    is_admin: +nickInfo.is_admin,
                    skin: nickInfo.skin,
                    skin_id: nickInfo.skin_id,
                    is_transparent_skin: +nickInfo.is_transparent_skin,
                    is_turning_skin: +nickInfo.is_turning_skin,
                    is_invisible_nick: +nickInfo.is_invisible_nick,
                    is_random_color: +nickInfo.is_random_color
                };
            }
            if (!Functions.isEmpty(nickInfo.password) && String(this.password) !== String(nickInfo.password)) {
                this.nick = "Wrong password";
                this.skin = "";
                this.skinId = "";
                this.isModer = 0;
                this.isAdmin = 0;
                this.isVerified = false;
                this.isChanged = true;
                this.isTransparentSkin = false;
                this.isTurningSkin = false;
                this.isInvisibleNick = false;
                this.isRandomColor = false;
                return true;
            }
            // this.nick = nickInfo.nick;
            this.skin = nickInfo.skin;
            this.skinId = +nickInfo.skin_id;
            this.isAdmin = +nickInfo.is_admin;
            this.isModer = +nickInfo.is_moder;
            this.isTransparentSkin = Boolean(+nickInfo.is_transparent_skin);
            this.isTurningSkin = Boolean(+nickInfo.is_turning_skin);
            this.isVerified = !Functions.isEmpty(nickInfo.password);
            this.isInvisibleNick = Boolean(+nickInfo.is_invisible_nick);
            this.isRandomColor = Boolean(+nickInfo.is_random_color);
        } else {
            if (!(this.nick.toLowerCase() in cachedNicks)) cachedNicks[this.nick.toLowerCase()] = false;
            this.skin = "";
            this.skinId = "";
            this.isAdmin = 0;
            this.isModer = 0;
            this.isVerified = false;
            this.isTransparentSkin = false;
            this.isTurningSkin = false;
            this.isInvisibleNick = false;
            this.isRandomColor = false;
        }
        this.isChanged = true;
    }

    async changeNick(nick, password = "") {
        this.nick = nick;
        this.password = password;
        await this.authNick();
    }

    changeColor(color) {
        this.color = color;
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].color = color;
        }
        this.isChanged = true;
    }

    update(delta = 1) {
        if (!this.isSpawned) return true;

        if (this.isRandomColor && this.color === this.toColor) {
            this.toColor = Functions.getRandomColor();
        }
        if (this.color !== this.toColor) {
            let currentColor = Functions.hexToRgb(this.color);
            let targetColor = Functions.hexToRgb(this.toColor);
            // console.log(targetColor + " " + this.toColor);
            let dR = targetColor.r - currentColor.r;
            let dG = targetColor.g - currentColor.g;
            let dB = targetColor.b - currentColor.b;
            let sR = Math.round(dR / 20);
            let sG = Math.round(dG / 20);
            let sB = Math.round(dB / 20);
            if(Math.abs(sR) < 1) sR = Functions.toSignNumber(1, dR);
            if(Math.abs(sG) < 1) sG = Functions.toSignNumber(1, dG);
            if(Math.abs(sB) < 1) sB = Functions.toSignNumber(1, dB);
            if(Math.abs(dR) < Math.abs(sR)) sR = dR;
            if(Math.abs(dG) < Math.abs(sG)) sG = dG;
            if(Math.abs(dB) < Math.abs(sB)) sB = dB;
            // console.log(sR);
            this.changeColor(Functions.rgbToHex(currentColor.r + sR, currentColor.g + sG, currentColor.b + sB));
        }

        this.updateI = 0;
        let mass = 0;

        if (this.isNeedSplit) {
            let length = this.cells.length;
            for (let i = 0; i < length; i++) {
                this.cells[i].split();
            }
            this.isNeedSplit = false;
        }

        for (; this.updateI < this.cells.length; this.updateI++) {
            if (this.isBreak) {
                this.cells[this.updateI].breakCell();
            }
            if (this.isNeedShoot) {
                this.cells[this.updateI].shoot();
            }
            if (Math.abs(this.toMass) > 0) {
                let byMass = this.toMass / (this.cells.length - this.updateI);
                this.toMass -= byMass;
                this.cells[this.updateI].toMass += byMass;
            }
            this.cells[this.updateI].update(delta);
            try {
                mass = (mass + this.cells[this.updateI].mass) || mass;
                if (this.cells[this.updateI].main) {
                    this.x = this.cells[this.updateI].x;
                    this.y = this.cells[this.updateI].y;
                }
            } catch {
            }
            // rendersArr.push(this.cells[this.updateI]);
        }
        if (mass > this.totalMass) this.totalMass = Math.floor(mass);
        this.mass = Math.floor(mass);
        this.isBreak = false;
        this.isNeedShoot = false;
    }

    split() {
        this.isNeedSplit = true;
        return true;

        let length = this.cells.length;
        for (let i = 0; i < length; i++) {
            this.cells[i].split();
        }

        this.isChanged = true;
    }

    shoot() {
        if (performance.now() - this.lastShootTime < 100) return true;
        this.isNeedShoot = true;
        this.lastShootTime = performance.now();
        return true;

        let length = this.cells.length;
        for (let i = 0; i < length; i++) {
            this.cells[i].shoot();
        }

        this.isChanged = true;
    }


    mouseMove(x, y) {
        this.mouse = {x, y};

        this.isChanged = true;
    }

    setStickers(stickers) {
        this.stickersSet = stickers;
        this.stickerI = null;

        this.isChanged = true;
    }

    destroy() {
        this.isSpawned = false;

        if (this.type === "player" && this.totalMass > dailyTop.mass) {
            dailyTop.mass = this.totalMass;
            dailyTop.nick = this.nick;
            dailyTop.skin = this.skin || "";
            dailyTop.skinId = this.skinId || "";
            game.wsMessage({
                action: "game_message",
                message: "Новый ежедневный рекорд " + this.totalMass + " установлен игроком " + this.nick
            });
            game.wsMessage({
                action: "get_daily_top",
                top: dailyTop
            });
        } else if (this.type === "bot") game.onDestroyUnit(this.constructor.name.toLowerCase(), this.wsId);
    }

    respawn() {
        if (this.isSpawned) return true;
        let coords = game.getRandomMapCoords();
        this.cells = [
            new Cell(coords.x, coords.y, gameInfo.startMass, 0, 0, true, this.color, this, 0, 0)
        ];
        this.cellId = 0;
        this.x = coords.x;
        this.y = coords.y;
        this.isSpawned = true;
        this.isSpectator = false;
        this.cells[0].updateDirection();
    }

    getMainCoords() {
        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i].main) return {x: this.cells[i].x, y: this.cells[i].y};
        }
    }

    setCoords(x, y) {
        let mainCoords = this.getMainCoords();
        let dX = x - mainCoords.x;
        let dY = y - mainCoords.y;
        for (let i = 0; i < this.cells.length; i++) {
            let toX = this.cells[i].x + dX;
            let toY = this.cells[i].y + dY;
            if (toX < 0) toX = 0;
            else if (toX > gameInfo.width) toX = gameInfo.width;
            if (toY < 0) toY = 0;
            else if (toY > gameInfo.height) toY = gameInfo.height;

            this.cells[i].x = toX;
            this.cells[i].y = toY;
        }
    }

}


class Game {


    constructor() {
        this.foodsArr = [];
        this.virusArr = [];
        this.bulletsArr = [];
        this.playersArr = [];
        this.virusFeedingArr = [];
        this.gameStates = [];
        this.foodId = 0;
        this.virusId = 0;
        this.bulletId = 0;
        this.playerId = 0;
        this.updatePlayerI = 0;
        this.onSpawnUnit = unit => "";
        this.onDestroyUnit = (type, id) => "";
        this.wsMessage = (message, id = null, besidesId = null, isNeedTime) => "";
        this.lastUpdateUnitsTime = performance.now();
    }


    startGame() {
        // return true;
        gameInfo.updateTime = performance.now();

        setTimeout(() => this.loop(), 0);
    }

    spawnUnit() {
        if (this.foodsArr.length < gameInfo.food) {
            let count = Functions.getRandomInt(0, gameInfo.food - this.foodsArr.length);
            for (let i = 0; i < count; i++) {
                this.foodsArr.push(
                    new Food(Functions.getRandomInt(10, gameInfo.width), Functions.getRandomInt(10, gameInfo.height), Functions.getRandomInt(gameInfo.foodMinMass, gameInfo.foodMaxMass), Functions.rgbToHex(Functions.getRandomInt(0, 255), Functions.getRandomInt(0, 255), Functions.getRandomInt(0, 255)))
                );
            }
        }
        if (this.virusArr.length < gameInfo.virus) {
            let count = Functions.getRandomInt(0, gameInfo.virus - this.virusArr.length);
            for (let i = 0; i < count; i++) {
                this.virusArr.push(
                    new Virus(Functions.getRandomInt(10, gameInfo.width), Functions.getRandomInt(10, gameInfo.height), 0, 0, 0)
                );
            }
        }
        if (this.virusFeedingArr.length < gameInfo.feedingVirusCount) {
            let count = Functions.getRandomInt(0, gameInfo.feedingVirusCount - this.virusFeedingArr.length);
            for (let i = 0; i < count; i++) {
                let coords = game.getRandomMapCoords();
                this.virusFeedingArr.push(
                    new Virus(coords.x, coords.y, 0, 0, 0, gameInfo.feedingVirusStartMass, "gold", true)
                );
            }
        }
    }

    getRandomMapCoords() {
        return {x: Functions.getRandomInt(50, gameInfo.width), y: Functions.getRandomInt(50, gameInfo.height)};
    }

    spawnBots() {
        let count = gameInfo.botsCount;
        for (let i = 0; i < this.playersArr.length; i++) {
            if (this.playersArr[i].type === "bot") count--;
        }
        while (count > 0) {
            let coords = this.getRandomMapCoords();
            let mouseCoords = this.getRandomMapCoords();
            this.playersArr.push(
                new Player(this.playerId++, coords.x, coords.y, gameInfo.startMass, mouseCoords.x, mouseCoords.y, Functions.getRandomColor(), "ni", "", "", "", "bot")
            );
            count--;
        }

    }

    updateUnit() {
        this.updatePlayerI = 0;
        for (; this.updatePlayerI < this.playersArr.length; this.updatePlayerI++) {
            if (this.playersArr[this.updatePlayerI].isDisconnect) {
                this.wsMessage({action: "player_disconnect", id: this.playersArr[this.updatePlayerI].wsId});
                this.playersArr.splice(this.updatePlayerI, 1);
                this.updatePlayerI--;
                continue;
            }
            this.playersArr[this.updatePlayerI].update(this.getTimeByDelta(gameInfo.deltaTime));
        }

        for (let i = 0; i < this.bulletsArr.length; i++) {
            this.bulletsArr[i].update();
        }

        for (let i = 0; i < this.virusArr.length; i++) {
            this.virusArr[i].update();
        }

        for (let i = 0; i < this.virusFeedingArr.length; i++) {
            this.virusFeedingArr[i].update();
        }

        // for (let i = 0; i < this.foodsArr.length; i++) {
        //     this.foodsArr[i].update();
        // }
    }

    addGameState() {
        this.gameStates.push({
            time: Date.now(),
            players: this.playersArr,
            foods: this.foodsArr,
            bullets: this.bulletsArr,
            virus: this.virusArr
        });
        if (Date.now() - this.gameStates[0].time >= 1000) {
            this.gameStates.shift();
        }
    }

    /**
     * @param time Number
     * @return Object | null
     */
    getGameState(time) {
        let length = this.gameStates.length;
        if (length === 0) return null;
        if (time < this.gameStates[0] - 15 || time > this.gameStates[length - 1] + 15) return null;
        if (length === 1) {
            return this.gameStates[0];
        }
        let state = null;
        let prevTime = Math.abs(time - this.gameStates[0].time);
        for (let i = 0; i < length; i++) {
            if (Math.abs(time - this.gameStates[i].time) > prevTime || i === length - 1) {
                state = this.gameStates[i - 1];
                break;
            }
            prevTime = Math.abs(time - this.gameStates[i].time);
        }

        return state;
    }

    /**
     * @param time Number
     * @param wsId Number
     * @return Player | null
     */
    getPlayerInGameState(time, wsId) {
        let state = this.getGameState(time);
        if (!state) return null;

        let length = state.players.length;
        let player = null;
        for (let i = 0; i < length; i++) {
            if (+state.players[i].wsId !== +wsId) continue;
            player = state.players[i];
            break;
        }
        return player;
    }

    loop() {
        while (performance.now() - gameInfo.updateTime >= gameInfo.perSecond) {
            // let time = performance.now();

            gameInfo.deltaTime = performance.now() - gameInfo.updateTime;
            gameInfo.updateTime = performance.now();
            let delta = this.getTimeByDelta(gameInfo.deltaTime);


            this.spawnUnit();
            this.updateUnit();
            this.addGameState();
            this.spawnBots();

            // if (performance.now() - this.lastUpdateUnitsTime > 1000 / 60) {
            let arr = [];
            // console.log(JSON.stringify(arr));
            arr = this.getAllUnits(false);
            let time = Date.now();
            for (let i = 0; i < this.playersArr.length; i++) {
                let player = this.playersArr[i];
                // if (player.type === "bot") continue;


                // if (performance.now() - player.lastUpdateUnitsTime >= 100) {
                //     arr = this.getAllUnits(false);
                //     player.lastUpdateUnitsTime = performance.now();
                // } else arr = this.getAllUnits(false, player.wsId);
                this.wsMessage({
                    a: "u",
                    u: arr,
                    time
                }, player.wsId, null, false);
            }
            // this.wsMessage({
            //     action: "u",
            //     u: arr,
            //     time: Date.now()
            // });
            this.lastUpdateUnitsTime = performance.now();
            // }
            // console.log(performance.now() - time);
        }

        // console.log(performance.now() - time);
        setTimeout(() => this.loop(), 0);
    }

    async playerConnect(wsId, color, nick = "SandL", password = "", token = "", userId = "", type = "player") {
        this.playersArr.push(
            new Player(wsId, Functions.getRandomInt(10, gameInfo.width), Functions.getRandomInt(10, gameInfo.height), gameInfo.startMass, 0, 0, color, nick, password, token, userId, "player", type === "spectator")
        );

    }

    playerDisconnect(wsId) {
        let player = this.findPlayer(wsId);
        if (!player) return true;

        setTimeout(() => {
            player.player.isDisconnect = true;
        }, 5000);

    }

    getAllUnits(all = true, wsId = null) {
        let p = [];
        for (let i = 0; i < this.playersArr.length; i++) {
            let player = this.playersArr[i];
            if (typeof wsId === "number" && player.wsId !== wsId) continue;
            // if (!all && !player.isChanged) continue;

            p.push(this.getUnit(player, all));
            this.playersArr[i].isChanged = false;
            if (typeof wsId === "number" && player.wsId === wsId) break;
        }


        let v = [];
        for (let i = 0; i < this.virusArr.length; i++) {
            let virus = this.virusArr[i];
            if (!all && !virus.isChanged) continue;

            v.push(this.getUnit(virus));
            this.virusArr[i].isChanged = false;
        }
        for (let i = 0; i < this.virusFeedingArr.length; i++) {
            let virus = this.virusFeedingArr[i];
            if (!all && !virus.isChanged) continue;

            v.push(this.getUnit(virus));
            this.virusFeedingArr[i].isChanged = false;
        }
        if (all) {

            let foods = this.foodsArr.map(unit => {
                return this.getUnit(unit);
            });

            let bullets = this.bulletsArr.map(unit => {
                return this.getUnit(unit);
            });

            return {p, foods, v, bullets};
        }
        return {p, v};
    }

    getUnit(unit, all = true) {
        let name = unit.constructor.name.toLowerCase();

        if (name === "player") {
            let obj = {
                name: "p",
                c: "", // cells
                // ci: unit.cellId, // cellId
                y: unit.mouse.y, // mouseY
                x: unit.mouse.x, // mouseX
                cl: unit.color, // color
                id: unit.wsId,
                nick: unit.nick,
                skin: unit.skin,
                skinId: unit.skinId,
                stickersSet: unit.stickersSet || "",
                stickerI: Functions.isEmpty(unit.stickerI) ? "" : unit.stickerI,
                its: +unit.isTransparentSkin,
                itrs: +unit.isTurningSkin,
                iin: +unit.isInvisibleNick
            };
            if (!all) {
                // delete obj.mouseY;
                // delete obj.mouseX;
                delete obj.itrs;
                delete obj.iin;
                delete obj.its;
                delete obj.nick;
                delete obj.skin;
                delete obj.skinId;
                delete obj.stickerI;
                delete obj.stickersSet;
            }
            let length = unit.cells.length;
            for (let i = 0; i < length; i++) {
                let cell = unit.cells[i];
                let objC = [cell.id, cell.x, cell.y, cell.mass, cell.main ? "t" : "f", ""].join(","); // id, x, y, mass, main
                // let objC = {
                //     x: cell.x,
                //     y: cell.y,
                //     m: cell.mass, // mass
                //     // tm: cell.toMass, // toMass
                //     // ss: cell.spaceSin, // spaceSin
                //     // sc: cell.spaceCos, // spaceCos
                //     // sd: cell.spaceDistance,
                //     // tsd: cell.totalSpaceDistane,
                //     // ed: cell.engineDistance,
                //     // es: cell.engineSin,
                //     // ec: cell.engineCos,
                //     // ic: cell.isConnect,
                //     id: cell.id,
                //     // c: cell.color,
                //     // icl: cell.isCollising,
                //     mn: cell.main,
                //     // s: cell.sin,
                //     // c: cell.cos
                // };
                // if (!all) {
                //     for (let key in objC) {
                //         if (!objC[key]) delete objC[key];
                //     }
                // }
                obj.c += objC;
            }
            obj.c = obj.c.substring(0, obj.c.length - 1);


            return obj;
        }

        if (name === "virus") {
            let isFeeding = unit.isFeeding ? "t" : "f";
            let obj = {
                name: "v",
                d: [unit.id, unit.x, unit.y, unit.mass, isFeeding].join(",") // id, x, y, mass, isFeeding
            };
            return obj;
        }
        let obj = {
            name,
            id: unit.id,
            x: unit.x,
            y: unit.y,
            mass: unit.mass,
            toMass: unit.toMass,
            color: unit.color,
        };
        if (name === "bullet" || name === "virus") {
            obj.sin = unit.sin;
            obj.cos = unit.cos;
            obj.distance = unit.distance;
        }

        return obj;
    }

    /**
     *
     * @param wsId Number
     * @param arr Array
     * @returns Object|null
     */
    findPlayer(wsId, arr = null) {
        arr = arr || this.playersArr;
        let length = arr.length;
        let player = null;
        let i = 0;
        for (; i < length; i++) {
            if (+arr[i].wsId !== +wsId) continue;
            player = arr[i];
            break;
        }
        if (!player) return null;
        return {player, count: i};
    }

    shoot(wsId, time) {
        // let playerState = this.getPlayerInGameState(time, wsId);
        let playerNow = this.findPlayer(wsId);
        // if (!playerState || !playerNow) return true;
        if (!playerNow) return true;
        // this.playersArr[playerNow.count] = playerState;
        this.playersArr[playerNow.count].shoot();
        // this.playersArr[playerNow.count].update(this.getTimeByDelta(Date.now() - time));
    }

    split(wsId, time) {
        // let playerState = this.getPlayerInGameState(time, wsId);
        let playerNow = this.findPlayer(wsId);
        // if (!playerState || !playerNow) return true;
        if (!playerNow) return true;
        // this.playersArr[playerNow.count] = playerState;
        this.playersArr[playerNow.count].split();
        // this.playersArr[playerNow.count].update(this.getTimeByDelta(Date.now() - time));
    }

    mouseMove(wsId, x, y, time) {
        // let playerState = this.getPlayerInGameState(time, wsId);
        let playerNow = this.findPlayer(wsId);
        if (!playerNow) return true;

        // this.playersArr[playerNow.count] = playerState;
        this.playersArr[playerNow.count].mouseMove(x, y);
        // this.playersArr[playerNow.count].update(this.getTimeByDelta(Date.now() - time));
        // setTimeout(() => {s
        //     player.mouseMove(x, y);
        // }, Date.now() - time);

    }

    getTimeByDelta(delta) {
        return delta / gameInfo.perSecond;
    }

    addMass(wsId, mass) {
        let player = this.findPlayer(wsId);
        if (!player) return false;

        this.playersArr[player.count].toMass += mass;
    }

    breakPlayer(wsId) {
        let player = this.findPlayer(wsId);
        if (!player) return false;

        this.playersArr[player.count].isBreak = true;
    }

    async changeNick(wsId, nick, password = "") {
        let player = this.findPlayer(wsId);
        if (!player) return true;

        player = player.player;
        await player.changeNick(nick, password);
    }

    changeColor(wsId, color) {
        let player = this.findPlayer(wsId);
        if (!player) return true;

        player = player.player;
        player.changeColor(color);
    }

    setStickers(wsId, stickers) {
        let player = this.findPlayer(wsId);
        if (!player) return false;

        this.playersArr[player.count].setStickers(stickers);
    }

    changeAccount(wsId, userId, token) {
        let player = this.findPlayer(wsId);
        if (!player) return false;

        this.playersArr[player.count].changeAccount(userId, token);
    }

    exportGameSettings() {
        return gameInfo;
    }

    exportDailyTop() {
        return dailyTop;
    }

    respawnPlayer(wsId) {
        let player = this.findPlayer(wsId);
        if (!player) return true;
        player.player.respawn();
    }

    teleportByCoords(wsId, x, y) {
        let player = this.findPlayer(wsId);
        if (!player) return true;

        if (x < 0) x = 0;
        else if (x > gameInfo.width) x = gameInfo.width;
        if (y < 0) y = 0;
        else if (y > gameInfo.height) y = gameInfo.height;

        player.player.setCoords(x, y);
    }

}

let game = exports.game = new Game();
