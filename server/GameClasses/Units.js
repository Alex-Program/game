const Functions = require('../functions.js');
const {Performance: performance} = require("./Perfromance.js");

let gameInfo = {
    width: 1000,
    height: 1000,
    startMass: 500,
    updateTime: 0,
    deltaTime: 0,
    perSecond: 1000 / 60,
    food: 500,
    foodMinMass: 50,
    foodMaxMass: 100,
    virus: 10
};


class Arc {

    constructor() {
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
        return 25 / this.drawableRadius;
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

};


let Food = exports.Food = class Food extends Arc {

    constructor(x, y, mass, color) {
        super();

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

    constructor(x, y, sin, cos, mass, distance, color = "#ff0400") {
        super();

        this.x = x;
        this.y = y;
        this.sin = sin;
        this.cos = cos;
        this.mass = mass;
        this.distance = distance;
        this.color = color;

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

        game.onSpawnUnit(this);
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
        }


        for (let i = 0; i < game.bulletsArr.length; i++) {
            let bullet = game.bulletsArr[i];

            let c = Math.sqrt((this.x - bullet.x) ** 2 + (this.y - bullet.y) ** 2);
            if (c > this.drawableRadius + bullet.drawableRadius + 3) continue;

            this.toMass += 50;
            game.bulletsArr.splice(i, 1);
            i--;

            if (this.mass >= 400) {
                this.toMass = Functions.roundFloor(this.toMass - (this.mass - 200));
                game.virusArr.push(
                    new Virus(this.x, this.y, bullet.sin, bullet.cos, 200)
                )
            }
        }


    }

}

class Cell extends Arc {

    constructor(x, y, mass, sin, cos, main = false, color = "#000000", owner, id, spaceDistance = 0) {
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
        setTimeout(() => this.isConnect = true, 1000);

        this.updateDirection();

    }


    update() {
        this.updateDirection();

        let speed = Math.min(this.mouseDist, this.speed);

        if (this.spaceDistance === 0) {
            this.x = Functions.roundFloor(this.x + this.cos * speed * this.timeRatio, 2);
            this.y = Functions.roundFloor(this.y + this.sin * speed * this.timeRatio, 2);
        }

        if (Math.abs(this.toMass) > 0) {
            let speed = this.toMass * this.timeRatio / 5;
            if (Math.abs(speed) < 1) speed = this.toMass >= 0 ? 1 : -1;
            if (Math.abs(this.toMass) < Math.abs(speed)) speed = this.toMass;

            this.mass = Math.round(this.mass + speed);
            this.toMass = Math.round(this.toMass - speed);
            if (this.mass >= 22500) {
                this.mass = 22500;
                this.toMass = 0;
            }
        }

        if (Math.abs(this.spaceDistance > 0)) {
            if (this.spaceDistance <= this.totalSpaceDistane / 1.3) this.isCollising = true;
            let speed = this.spaceDistance * this.timeRatio / 15;
            if (Math.abs(speed) < 1) speed = this.spaceDistance >= 0 ? 1 : -1;
            // if (Math.abs(speed) > 10) speed = this.spaceDistance >= 0 ? 10 : -10;
            if (Math.abs(this.spaceDistance) < Math.abs(speed)) speed = this.spaceDistance;

            this.x = Functions.roundFloor(this.x + speed * this.spaceCos * this.speed, 2);
            this.y = Functions.roundFloor(this.y + speed * this.spaceSin * this.speed, 2);
            this.spaceDistance = Functions.roundFloor(this.spaceDistance - speed, 2);
        }

        if (Math.abs(this.engineDistance > 0)) {
            let speed = this.engineDistance * this.timeRatio / 2;
            if (Math.abs(speed) < 10) speed = this.engineDistance >= 0 ? 10 : -10;
            if (Math.abs(speed) > 30) speed = this.engineDistance >= 0 ? 30 : -30;
            if (Math.abs(this.engineDistance) < Math.abs(speed)) speed = this.engineDistance;

            this.x = Functions.roundFloor(this.x + speed * this.engineCos * this.speed, 2);
            this.y = Functions.roundFloor(this.y + speed * this.engineSin * this.speed, 2);
            this.engineDistance = Functions.roundFloor(this.engineDistance - speed, 2);
        }

        for (let i = 0; i < game.bulletsArr.length; i++) {
            let bullet = game.bulletsArr[i];
            let c = Math.sqrt((this.x - bullet.x) ** 2 + (this.y - bullet.y) ** 2);
            if (this.drawableRadius >= c) {
                this.toMass += 10;
                game.bulletsArr.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < game.virusArr.length; i++) {
            if (this.mass < 250) break;

            let virus = game.virusArr[i];

            let c = Math.sqrt((this.x - virus.x) ** 2 + (this.y - virus.y) ** 2);
            if (c > this.drawableRadius - 0.5 * virus.drawableRadius) continue;

            let count = Math.min(Math.floor((this.mass / 2) / 50), 64 - this.owner.cells.length);
            let mass = Math.floor((this.mass / 2) / count);
            let angleStep = 180 / count;
            let angle = Functions.getAngle(this.sin, this.cos);

            this.isCollising = true;

            let currentAngle = angle.degree - 90;

            while (count > 0) {
                let sin = Math.sin(Functions.degreeToRadians(currentAngle));
                let cos = Math.cos(Functions.degreeToRadians(currentAngle));

                let distance = this.radius + mass / 10 + 5;
                this.owner.cells.push(
                    new Cell(this.x + distance * cos, this.y + distance * sin, mass, sin, cos, false, this.color, this.owner, this.owner.cells.length, 50)
                );
                currentAngle += angleStep;
                count--;
            }

            this.toMass -= this.mass / 2;
            game.virusArr.splice(i, 1);
            i--;
        }

        for (let i = 0; i < game.foodsArr.length; i++) {
            let food = game.foodsArr[i];
            let c = Math.sqrt((this.x - food.x) ** 2 + (this.y - food.y) ** 2);
            if (c > this.drawableRadius + food.drawableRadius + 1) continue;

            this.toMass += food.mass;
            game.foodsArr.splice(i, 1);
            i--;
        }

        if (this.x < 0) this.x = 0;
        else if (this.x > gameInfo.width) this.x = gameInfo.width;

        if (this.y < 0) this.y = 0;
        else if (this.y > gameInfo.height) this.y = gameInfo.height;

        this.engineSin = 0;
        this.engineCos = 0;
        if (this.x <= 0 || this.x >= gameInfo.width) {
            this.engineCos = -this.cos;
            this.engineDistance = this.x <= 0 ? -this.x : this.x - gameInfo.width;
        }
        if (this.y <= 0 || this.y >= gameInfo.height) {
            this.engineSin = -this.sin;
            this.engineDistance = this.y <= 0 ? -this.y : this.y - gameInfo.height;
        }

        for (let i = 0; i < this.owner.cells.length; i++) {
            if (i === this.owner.updateI) continue;

            let cell = this.owner.cells[i];
            // if (this.mass < cell.mass) continue;
            if (!cell.isCollising || !this.isCollising) continue;

            let distance = Functions.roundFloor(Math.sqrt((cell.x - this.x) ** 2 + (cell.y - this.y) ** 2), 2);
            let different = Functions.roundFloor(this.drawableRadius + cell.drawableRadius - distance, 2);

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

            if (distance <= Functions.roundFloor(this.drawableRadius - cell.drawableRadius / 2, 2)) {
                this.toMass = Functions.roundFloor(this.toMass + cell.mass, 2);
                this.main = cell.main || this.main;
                this.owner.cells.splice(i, 1);
                if (this.owner.updateI > i) {
                    i--;
                    this.owner.updateI--;
                }
                // this.isConnect = false;
                // setTimeout(() => this.isConnect = true, 100);
            }

        }


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


    split(delta) {
        this.isCollising = true;
        let mass = this.mass + this.toMass;
        if (this.owner.cells.length === 64 || mass <= 250) return true;

        let speed = Math.min(this.mouseDist, this.speed);

        this.x = Functions.roundFloor(this.x - this.cos * speed * delta, 2);
        this.y = Functions.roundFloor(this.y - this.sin * speed * delta, 2);

        this.isConnect = false;
        setTimeout(() => this.isConnect = true, 1000);

        let height = this.radius * this.sin * 1.1;
        let width = this.radius * this.cos * 1.1;

        this.toMass = Math.floor(this.toMass - mass / 2);

        let distance = 50000 / mass + mass / 10;

        this.owner.cells.push(
            new Cell(Functions.roundFloor(this.x + width, 2), Functions.roundFloor(this.y + height, 2), mass / 2, this.sin, this.cos, false, this.color, this.owner, this.owner.cells.length, distance)
        );

    }


    shoot() {
        if (this.mass + this.toMass < 250) return true;

        game.bulletsArr.push(
            new Bullet(this.x + (this.radius + 5) * this.cos, this.y + (this.radius + 5) * this.sin, this.sin, this.cos, 150, 200)
        );
        this.toMass -= 10;
    }

}

class Player {

    constructor(wsId, x, y, mass, mouseX, mouseY, color = "#000000", nick) {
        this.nick = nick;
        this.mouse = {
            x: mouseX,
            y: mouseY
        };

        this.cells = [
            new Cell(x, y, mass, 0, 0, true, color, this, 0, 0)
        ];

        this.updateI = 0;
        this.wsId = wsId;
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.color = color;
        // clients[wsId].isConnect = true;

        // this.connect();
        this.cells[0].updateDirection();
        game.onSpawnUnit(this);
    }

    update() {
        this.updateI = 0;
        for (; this.updateI < this.cells.length; this.updateI++) {
            this.cells[this.updateI].update();
            // rendersArr.push(this.cells[this.updateI]);
        }
    }

    split(delta) {
        let length = this.cells.length;
        for (let i = 0; i < length; i++) {
            this.cells[i].split(delta);
        }

    }

    shoot() {
        let length = this.cells.length;
        for (let i = 0; i < length; i++) {
            this.cells[i].shoot();
        }
    }


    mouseMove(x, y) {
        this.mouse = {x, y};
    }

}


class Game {


    constructor() {
        this.foodsArr = [];
        this.virusArr = [];
        this.bulletsArr = [];
        this.playersArr = [];
        this.onSpawnUnit = (unit) => "";

    }

    startGame() {
        gameInfo.updateTime = performance.now();

        setTimeout(() => this.loop(), 0);


    }

    spawnUnit() {
        if (this.foodsArr.length < gameInfo.food) {
            let count = Functions.getRandomInt(0, gameInfo.food - this.foodsArr.length);
            for (let i = 0; i < count; i++) {
                this.foodsArr.push(
                    new Food(Functions.getRandomInt(10, gameInfo.width), Functions.getRandomInt(10, gameInfo.height), Functions.getRandomInt(gameInfo.foodMinMass, gameInfo.foodMaxMass), Functions.rgbToHex(Functions.getRandomInt(0, 255), Functions.getRandomInt(0, 255), Functions.getRandomInt(0, 255)))
                )
            }
        }
        if (this.virusArr.length < gameInfo.virus) {
            let count = Functions.getRandomInt(0, gameInfo.virus - this.virusArr.length);
            for (let i = 0; i < count; i++) {
                this.virusArr.push(
                    new Virus(Functions.getRandomInt(10, gameInfo.width), Functions.getRandomInt(10, gameInfo.height), 0, 0, 0)
                )
            }
        }
    }

    updateUnit() {
        for (let i = 0; i < this.playersArr.length; i++) {
            this.playersArr[i].update();
        }

        for (let i = 0; i < this.bulletsArr.length; i++) {
            this.bulletsArr[i].update();
        }

        for (let i = 0; i < this.virusArr.length; i++) {
            this.virusArr[i].update();
        }

        for (let i = 0; i < this.foodsArr.length; i++) {
            this.foodsArr[i].update();
        }
    }

    loop() {
        let time = performance.now();
        while (performance.now() - gameInfo.updateTime >= gameInfo.perSecond) {
            gameInfo.deltaTime = performance.now() - gameInfo.updateTime;
            gameInfo.updateTime = performance.now();


            this.spawnUnit();
            this.updateUnit();

            // console.log(performance.now() - time);
        }

        // console.log(performance.now() - time);
        setTimeout(() => this.loop(), 0);
    }

    playerConnect(wsId, color, nick = "NickName") {
        this.playersArr.push(
            new Player(wsId, Functions.getRandomInt(10, gameInfo.width), Functions.getRandomInt(10, gameInfo.height), gameInfo.startMass, 0, 0, color, nick)
        );

    }

    playerDisconnect(wsId) {
        let length = this.playersArr.length;
        for (let i = 0; i < length; i++) {
            if (+wsId !== +this.playersArr[i].wsId) continue;

            this.playersArr.splice(i, 1);
            break;
        }
    }

    getAllUnits() {
        let units = [...this.playersArr, ...this.foodsArr, ...this.virusArr, ...this.bulletsArr];
        units = units.map(unit => {
            return this.getUnit(unit);
        });

        return units;
    }

    getUnit(unit) {
        let name = unit.constructor.name.toLowerCase();

        if (name === "player") {
            let obj = {
                name,
                cells: [],
                mouseY: unit.mouse.y,
                mouseX: unit.mouse.x,
                color: unit.color,
                id: unit.wsId,
                nick: unit.nick
            };
            let length = unit.cells.length;
            for (let i = 0; i < length; i++) {
                let cell = unit.cells[i];
                obj.cells.push({
                    x: cell.x,
                    y: cell.y,
                    mass: cell.mass,
                    toMass: cell.toMass,
                    spaceSin: cell.spaceSin,
                    spaceCos: cell.spaceCos,
                    spaceDistance: cell.spaceDistance,
                    totalSpaceDistane: cell.totalSpaceDistane,
                    engineDistance: cell.engineDistance,
                    engineSin: cell.engineSin,
                    engineCos: cell.engineCos,
                    isConnect: true,
                    id: cell.id,
                    isCollising: cell.isCollising,
                    main: cell.main
                });
            }


            return obj;
        }

        let obj = {
            name,
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
     * @returns Player|null
     */
    findPlayer(wsId) {
        let length = this.playersArr.length;
        let player = null;
        for (let i = 0; i < length; i++) {
            if (+this.playersArr[i].wsId !== +wsId) continue;
            player = this.playersArr[i];
        }
        return player;
    }

    shoot(wsId) {
        let player = this.findPlayer(wsId);
        if (!player) return true;

        player.shoot();
    }

    split(wsId, time) {
        let player = this.findPlayer(wsId);
        if (!player) return true;

        player.split(this.getTimeByDelta(Date.now() - time));
    }

    mouseMove(wsId, x, y, time) {
        let player = this.findPlayer(wsId);
        if (!player) return true;

        setTimeout(() => {
            player.mouseMove(x, y);
        }, Date.now() - time);

    }

    getTimeByDelta(delta) {
        return delta / gameInfo.perSecond;
    }

}

let game = exports.game = new Game();
