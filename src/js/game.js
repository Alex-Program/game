// (function () {
//     let gameInfo = {
//         pause: false
//     };
//
//
//     function getIntRandom(min, max) {
//         return Math.round((max - min) * Math.random() + min);
//     }
//
//     function roundFloor(number, count = 2) {
//         return Math.round(number * (10 ** count)) / (10 ** count);
//     }
//
//     class Arc {
//
//         constructor() {
//         }
//
//         render() {
//             context.globalCompositeOperation = "source-over";
//
//             let differentX = this.x - mapInfo.centerX;
//             let differentY = this.y - mapInfo.centerY;
//             if (this.constructor.name.toLowerCase() !== "cell") {
//                 if (Math.abs(differentX) > 400 || Math.abs(differentY) > 400) return;
//             }
//
//             let drawableX = roundFloor(canvas.width / 2 + differentX, 2);
//             let drawableY = roundFloor(canvas.height / 2 + differentY, 2);
//             if (drawableX < 0 || drawableX > canvas.width || drawableY < 0 || drawableY > canvas.height) return true;
//
//             context.beginPath();
//             context.fillStyle = this.color;
//             context.arc(drawableX, drawableY, this.radius, 0, Math.PI * 2, false);
//             context.fill();
//             context.closePath();
//
//             if (this.constructor.name.toLowerCase() === "cell") {
//                 if (this.p.isImage) {
//                     context.save();
//                     context.clip();
//                     context.globalCompositeOperation = "source-in";
//                     context.drawImage(this.p.image, drawableX - this.radius, drawableY - this.radius, this.radius * 2, this.radius * 2);
//                     context.restore();
//
//                 }
//
//             }
//             if (this.constructor.name.toLowerCase() === "spike" && imagesArr.virus.isImage) {
//                 context.save();
//                 context.clip();
//                 context.globalCompositeOperation = "source-atop";
//                 context.drawImage(imagesArr.virus.image, drawableX - this.radius, drawableY - this.radius, this.radius * 2, this.radius * 2);
//                 context.restore();
//             }
//             if (["spike", "cell"].includes(this.constructor.name.toLowerCase())) {
//                 context.fillStyle = "#FFFFFF";
//                 context.textAlign = "center";
//                 context.textBaseline = "middle";
//                 context.font = String(this.radius / 2) + "px Verdana";
//                 context.fillText(String(Math.floor(this.mass)), drawableX, drawableY);
//             }
//
//         }
//     }
//
//     class Food extends Arc {
//
//         constructor(x, y, radius, color) {
//             super();
//             this.x = x;
//             this.y = y;
//             this.radius = radius;
//             this.color = color;
//         }
//
//
//         update() {
//
//             this.render();
//         }
//
//     }
//
//
//     class Cell extends Arc {
//
//         constructor(startX, startY, sin, cos, mass, fromSpace = true, isMain = false, p, id = 0, color = "#ff0000", isConnect = false, plusMass = null, fromId) {
//             super();
//             this.startX = startX;
//             this.startY = startY;
//             this.x = this.startX;
//             this.y = this.startY;
//             this.fromSpace = fromSpace;
//             this.mass = mass;
//             // this.radius = roundFloor(this.mass / 10, 2);
//             this.sin = sin;
//             this.cos = cos;
//             this.cosSpace = this.cos;
//             this.sinSpace = this.sin;
//             this.color = color;
//             this.isMain = isMain;
//             this.p = p;
//             this.id = id;
//             this.isSplit = false;
//             this.splitToMass = this.mass;
//             this.isConnect = isConnect;
//             this.plusMass = plusMass;
//             this.plusDistance = roundFloor(this.radius, 2);
//             this.distance = this.plusDistance;
//             this.connectTime = this.isConnect ? 0 : 500;
//             this.prevTime = performance.now();
//             this.speed = roundFloor(70 / this.mass, 2);
//             this.fromId = fromId;
//         }
//
//
//         update() {
//             this.updateDirection();
//             let differentX = mapInfo.centerX - canvas.width / 2 + mouseCoords.x - this.x;
//             let differentY = mapInfo.centerY - canvas.height / 2 + mouseCoords.y - this.y;
//             // if (Math.abs(differentX) < 1) this.cos = 0;
//             // if (Math.abs(differentY) < 1) this.sin = 0;
//
//             this.x = roundFloor(this.x + this.cos * this.speed, 2);
//             this.y = roundFloor(this.y + this.sin * this.speed, 2);
//
//             if (this.connectTime > 0) {
//                 this.connectTime = this.connectTime - (performance.now() - this.prevTime);
//                 this.prevTime = performance.now();
//                 if (this.connectTime < 0) this.connectTime = 0;
//
//             }
//
//             let differentSpeed = roundFloor(70 / this.mass - this.speed, 2);
//             if (differentSpeed > 0 || differentSpeed < 0) {
//                 let plusSpeed = roundFloor(differentSpeed / 20, 2);
//                 if (Math.abs(differentSpeed) < 0.01) plusSpeed = differentSpeed;
//                 // if (differentSpeed > 0.1) differentSpeed /= 5;
//                 this.speed = roundFloor(this.speed + plusSpeed, 2);
//             }
//
//
//             if (this.isSplit) {
//                 let toMass = roundFloor(this.mass - this.mass / 3, 2);
//                 if (toMass < this.splitToMass) toMass = this.splitToMass;
//                 this.mass = toMass;
//                 if (this.mass <= this.splitToMass) this.isSplit = false;
//             }
//             if (this.plusMass > 0 || this.plusMass < 0) {
//                 this.connectTime = 0;
//                 let plus = this.plusMass / 10;
//                 if (Math.abs(this.plusMass) < 1) plus = this.plusMass;
//
//
//                 this.mass = roundFloor(this.mass + plus, 2);
//                 this.plusMass = roundFloor(this.plusMass - plus, 2);
//                 if (this.plusMass === 0 && this.isConnect) {
//                     this.isConnect = false;
//                     this.mass = Math.floor(this.mass);
//                 }
//             }
//
//             if (this.fromSpace && this.plusDistance > 0) {
//                 let distance = this.plusDistance / 15;
//                 if (this.plusDistance < this.distance / 20) {
//                     // distance = this.plusDistance > (this.distance / 15) ? (this.distance / 15) : this.plusDistance;
//                     this.plusDistance = 0;
//                 }
//                 let width = this.cosSpace * distance;
//                 let height = this.sinSpace * distance;
//                 this.x = roundFloor(this.x + width, 2);
//                 this.y = roundFloor(this.y + height, 2);
//                 this.plusDistance -= distance;
//
//                 if (this.plusDistance <= 0) {
//                     this.plusDistance = 0;
//                     // this.fromSpace = false;
//
//                     setTimeout(() => {
//                         this.fromSpace = false;
//                         this.connectTime = 0;
//                     }, 50);
//                 }
//                 // this.x = roundFloor(this.x + this.cos * 2, 2);
//                 // this.y = roundFloor(this.y + this.sin * 2, 2);
//                 // return this.render();
//             }
//
//
//             if (!this.fromSpace) {
//                 let foodsLength = foodsArr.length;
//                 for (let i = 0; i < foodsLength; i += 2) {
//                     let food = foodsArr[i];
//                     if (((this.x - food.x) ** 2 + (this.y - food.y) ** 2) <= (this.radius + food.radius + 1) ** 2) {
//                         this.plusMass = Math.floor(3);
//                         foodsArr.splice(i, 1);
//                         i--;
//                         foodsLength--;
//                     }
//
//                     try {
//                         food = foodsArr[i + 1];
//                         if (((this.x - food.x) ** 2 + (this.y - food.y) ** 2) <= (this.radius + food.radius + 1) ** 2) {
//                             this.plusMass = Math.floor(3);
//                             foodsArr.splice(i + 1, 1);
//                             // i--;
//                             foodsLength--;
//                         }
//                     } catch (e) {
//                     }
//
//                 }
//                 for (let i = 0; i < bulletsArr.length; i++) {
//                     let bullet = bulletsArr[i];
//                     if (Math.sqrt((this.x - bullet.x) ** 2 + (this.y - bullet.y) ** 2) <= (this.radius + bullet.radius - 1)) {
//                         this.plusMass = Math.floor(10);
//                         bulletsArr.splice(i, 1);
//                         i--;
//                     }
//                 }
//             }
//
//             let cellsLength = this.p.cells.length;
//             for (let i = 0; i < cellsLength; i++) {
//                 if (i === this.id) continue;
//
//                 let cell = this.p.cells[i];
//                 // if (cell.isSplit || this.isSplit) continue;
//
//                 let distance = Math.sqrt((this.x - cell.x) ** 2 + (this.y - cell.y) ** 2);
//                 let different = this.radius + cell.radius - distance;
//                 if (different > 0 && (this.connectTime > 0 || cell.connectTime > 0 || this.fromSpace || cell.fromSpace)) {
//                     // if(this.radius > cell.radius) continue;
//                     if ((this.fromSpace && this.fromId === cell.id) || (cell.fromSpace && cell.fromId === this.id)) continue;
//                     let cos = (this.x - cell.x) / distance;
//                     let sin = (this.y - cell.y) / distance;
//
//                     if (different < (this.radius + cell.radius) / 100) {
//                         let width = cos * different;
//                         let height = sin * different;
//                         this.x = roundFloor(this.x + width, 2);
//                         this.y = roundFloor(this.y + height, 2);
//                     } else {
//                         let width = cos * different / 20;
//                         let height = sin * different / 20;
//                         this.x = roundFloor(this.x + width, 2);
//                         this.y = roundFloor(this.y + height, 2);
//                     }
//                     if (this.fromSpace) this.plusDistance = 0;
//                     if (cell.fromSpace) cell.plusDistance = 0;
//
//                 }
//                 if (different <= 0) {
//                     if (this.plusDistance === 0) this.fromSpace = false;
//                     if (cell.plusDistance === 0) cell.fromSpace = false;
//                 }
//
//
//                 if (cell.fromSpace) continue;
//
//                 if (this.connectTime <= 0 && cell.connectTime <= 0 && this.radius <= cell.radius) {
//                     if (roundFloor(distance + this.radius * 0.5, 2) <= cell.radius) {
//                         this.p.cells.splice(this.id, 1);
//                         if(this.p.i > this.id) this.p.i--;
//                         if (i > this.id) cell.id--;
//
//                         // this.p.cells.splice(cell.id, 1);
//                         cell.isMain = this.isMain || cell.isMain;
//                         cell.plusMass = roundFloor(cell.plusMass + this.mass);
//                         // this.p.cells.push(
//                         //     new Cell(cell.x, cell.y, cell.sin, cell.cos, cell.mass, false, isMain, this.p, this.p.cells.length, this.color, true, this.mass)
//                         // );
//
//                         this.p.updateId();
//
//                         return true;
//                     }
//
//                 }
//             }
//
//             if (this.isMain) {
//                 let byX = (this.x - mapInfo.centerX) / 20;
//                 let byY = (this.y - mapInfo.centerY) / 20;
//                 if (Math.abs(byX) <= 0.2) byX = this.x - mapInfo.centerX;
//                 if (Math.abs(byY) <= 0.2) byY = this.y - mapInfo.centerY;
//                 byX = roundFloor(byX, 2);
//                 byY = roundFloor(byY, 2);
//                 mapInfo.centerX = roundFloor(mapInfo.centerX + byX, 2);
//                 mapInfo.centerY = roundFloor(mapInfo.centerY + byY, 2);
//             }
//
//             this.render();
//         }
//
//         updateDirection() {
//             if (this.fromSpace) return true;
//
//             this.speed = roundFloor(this.speed - this.speed / 40, 2);
//             let differentX = mapInfo.centerX - canvas.width / 2 + mouseCoords.x - this.x;
//             let differentY = mapInfo.centerY - canvas.height / 2 + mouseCoords.y - this.y;
//             let c = Math.sqrt(differentX ** 2 + differentY ** 2);
//             let sin = differentY / c || 0;
//             let cos = differentX / c || 0;
//
//             // try {
//             //     clearTimeout(this.timeOutDirection);
//             // } catch (e) {
//             // }
//             // this.timeOutDirection = setTimeout(() => {
//
//             this.sin = Math.abs(differentY) > 5 ? roundFloor(sin, 2) : 0;
//             this.cos = Math.abs(differentX) > 5 ? roundFloor(cos, 2) : 0;
//
//             // }, 50);
//
//
//         }
//
//         shoot() {
//             if (this.mass < 50) return true;
//
//             this.plusMass = Math.floor(-12);
//             let height = this.sin * (this.radius + 10 + 5);
//             let width = this.cos * (this.radius + 10 + 5);
//
//             bulletsArr.push(new Bullet(this.x + width, this.y + height, this.sin, this.cos, 10));
//         }
//
//         get radius() {
//             return this.mass / 5
//         }
//
//         set radius(val) {
//             this.mass = Math.floor(val * 5);
//         }
//
//         split() {
//             if (this.mass < 100) return true;
//
//             // this.startRadius = this.radius;
//             this.fromSpace = false;
//             this.updateDirection();
//             this.isSplit = true;
//             this.splitToMass = Math.round(this.mass / 2);
//             // this.radius = roundFloor(this.radius / 2, 2);
//             let cos = this.cos;
//             let sin = this.sin;
//             if (!sin && !cos) [sin, cos] = [1, 0];
//             let width = roundFloor(cos * this.radius + 10, 2);
//             let height = roundFloor(sin * this.radius + 10, 2);
//
//             this.connectTime = 500;
//             this.prevTime = performance.now();
//             this.p.cells.push(
//                 new Cell(this.x + width, this.y + height, sin, cos, Math.floor(this.mass / 2), true, false, this.p, this.p.cells.length, this.color, false, null, this.id)
//             )
//         }
//
//     }
//
//     class Player {
//         constructor(x, y, color = "#ff0000") {
//             this.isImage = false;
//             this.image = new Image();
//             this.image.src = "https://avatars.mds.yandex.net/get-pdb/909209/02d30d51-cfa4-405e-b853-fab17bfaadce/s1200";
//             this.image.onload = () => this.isImage = true;
//
//             this.x = x;
//             this.y = y;
//             this.radius = 700;
//             this.sin = 0;
//             this.cos = 0;
//             this.color = color;
//             this.cells = [
//                 new Cell(this.x, this.y, this.sin, this.cos, this.radius, false, true, this, 0, this.color)
//             ];
//             this.cells[0].updateDirection(this.x, this.y);
//             this.i = 0;
//         }
//
//         render() {
//             this.i = 0;
//             let length = this.cells.length;
//             for (; this.i < this.cells.length; this.i++) {
//                 let cell = this.cells[this.i];
//                 cell.update();
//                 // try {
//                 //     cell = this.cells[i + 1];
//                 //     cell.update();
//                 // } catch (e) {
//                 // }
//             }
//             // context.beginPath();
//             // context.fillStyle = this.color;
//             // context.arc(canvas.width / 2, canvas.height / 2, this.radius, 0, Math.PI * 2, false);
//             // context.fill();
//             // context.closePath();
//             // context.fillStyle = "#FFFFFF";
//             // context.textAlign = "center";
//             // context.textBaseline = "middle";
//             // context.font = String(this.radius / 2) + "px Verdana";
//             // context.fillText(this.radius, canvas.width / 2, canvas.height / 2);
//         }
//
//         update() {
//             this.render();
//
//             // if (gameInfo.pause) return this.render();
//             //
//             //
//             // let differentX = mouseCoords.x - canvas.width / 2;
//             // let differentY = mouseCoords.y - canvas.height / 2;
//             //
//             // if (Math.abs(differentX) < 5) differentX = 0;
//             // if (Math.abs(differentY) < 5) differentY = 0;
//             //
//             // let c = Math.sqrt(differentX ** 2 + differentY ** 2);
//             // let sin = differentY / c || 0;
//             // let cos = differentX / c || 0;
//             // this.x = roundFloor(this.x + cos * 2, 2);
//             // this.y = roundFloor(this.y + sin * 2, 2);
//
//
//             // this.render();
//         }
//
//         updateDirection() {
//             // let differentX = mouseCoords.x - canvas.width / 2;
//             // let differentY = mouseCoords.y - canvas.height / 2;
//             // let c = Math.sqrt(differentX ** 2 + differentY ** 2);
//             // let sin = differentY / c || 0;
//             // let cos = differentX / c || 0;
//             // this.sin = roundFloor(sin, 2);
//             // this.cos = roundFloor(cos, 2);
//
//             for (let i = 0; i < this.cells.length; i++) {
//                 this.cells[i].updateDirection();
//             }
//         }
//
//         shoot() {
//             for (let i = 0; i < this.cells.length; i++) {
//                 this.cells[i].shoot();
//             }
//         };
//
//         split() {
//             let startLength = this.cells.length;
//             let length = startLength;
//             if (startLength === 64) return true;
//             for (let i = 0; i < startLength; i++) {
//                 if (length === 64) break;
//                 length++;
//                 this.cells[i].split(this);
//             }
//         }
//
//         updateId() {
//             let length = this.cells.length;
//             for (let i = 0; i < length; i++) {
//                 this.cells[i].id = i;
//                 this.cells[i].updateDirection();
//             }
//         }
//
//     }
//
//
//     class Bullet extends Arc {
//
//         constructor(startX, startY, sin, cos, radius) {
//             super();
//             this.startX = startX;
//             this.startY = startY;
//             this.sin = sin;
//             this.cos = cos;
//             this.x = startX;
//             this.y = startY;
//             this.radius = radius;
//             this.speed = 100 / this.radius;
//             this.color = "#000000";
//             this.fromW = true;
//         }
//
//
//         update() {
//             if (!this.fromW) return this.render();
//
//             if (this.speed > 50 / this.radius) {
//                 let bySpeed = (this.speed - (50 / this.radius)) / 20;
//                 if (bySpeed < 5) bySpeed = 5;
//                 this.speed = roundFloor(this.speed - bySpeed, 2);
//                 if (this.speed < 10 / this.radius) this.speed = 50 / this.radius
//             }
//
//             let c = Math.sqrt((this.x - this.startX) ** 2 + (this.y - this.startY) ** 2);
//             if (c < 100) {
//                 this.y = roundFloor(this.y + this.sin * this.speed, 2);
//                 this.x = roundFloor(this.x + this.cos * this.speed, 2);
//
//             } else this.fromW = false;
//
//             this.render();
//         }
//
//
//     }
//
//
//     class Spike extends Arc {
//
//         constructor(startX, startY, sin, cos, mass, isStatic = true) {
//             super();
//             this.startX = startX;
//             this.startY = startY;
//             this.sin = sin;
//             this.cos = cos;
//             this.mass = mass;
//             this.isStatic = isStatic;
//             this.x = this.startX;
//             this.y = this.startY;
//             this.color = "#ffbb01";
//             this.plusMass = 0;
//             this.toDitance = 150;
//         }
//
//         get radius() {
//             return this.mass / 5;
//         }
//
//         set radius(val) {
//             this.mass = Math.floor(val * 5);
//         }
//
//         update() {
//             if (this.plusMass > 0 || this.plusMass < 0) {
//                 let plus = this.plusMass / 3;
//                 if (Math.abs(this.plusMass) < 1) plus = this.plusMass;
//
//
//                 this.mass = roundFloor(this.mass + plus, 2);
//                 this.plusMass = roundFloor(this.plusMass - plus, 2);
//                 if (this.plusMass === 0) this.mass = Math.floor(this.mass);
//             }
//
//             if (this.isStatic) return this.render();
//
//             if (this.toDitance > 0) {
//                 let distance = this.toDitance / 10;
//                 if (distance < 5) distance = 5;
//                 if (this.toDitance < distance) distance = this.toDitance;
//                 this.x = roundFloor(this.x + distance * this.cos);
//                 this.y = roundFloor(this.y + distance * this.sin);
//                 this.toDitance = roundFloor(this.toDitance - distance);
//                 if (this.toDitance <= 0) {
//                     this.toDitance = 0;
//                     this.isStatic = true;
//                 }
//             }
//
//
//             this.render();
//         }
//
//         feed(mass = 15, sin, cos) {
//             this.plusMass = roundFloor(mass, 2);
//             if (this.mass < 175) return true;
//
//             this.plusMass = 100 - this.mass;
//             spikesArr.push(new Spike(this.x, this.y, sin, cos, 100, false));
//         }
//
//     }
//
//     let canvas = document.getElementById("canvas");
//     let context = canvas.getContext("2d");
//
//
//     let mapInfo = {
//         width: 1000,
//         height: 1000,
//         foodCount: 300,
//         spikeCount: 1,
//         scale: 0,
//         centerX: 0,
//         centerY: 0
//     };
//
//     /////////////////////
//     function resizeCanvas() {
//         canvas.width = window.innerWidth;
//         canvas.height = window.innerHeight;
//     }
//
//     resizeCanvas();
//     window.addEventListener("resize", resizeCanvas);
//     /////////////////////
//
//
//     let mouseCoords = {
//         x: 0,
//         y: 0
//     };
//
//     $("body")[0].addEventListener("mousemove", event => {
//         [mouseCoords.x, mouseCoords.y] = [event.clientX, event.clientY];
//         if (player) player.updateDirection();
//     });
//
//     let colors = [
//         "#c9d320",
//         "#ff042b",
//         "#0078ff",
//         "#5dfff3",
//         "#5fff36",
//         "#ff20e4",
//         "#ffbb01",
//         "#c8ff05",
//         "#00deff",
//         "#e600ff",
//     ];
//
//     mapInfo.centerX = getIntRandom(10, mapInfo.width);
//     mapInfo.centerY = getIntRandom(10, mapInfo.height);
//     let player = new Player(mapInfo.centerX, mapInfo.centerY);
//     let foodsArr = [];
//     let bulletsArr = [];
//     let spikesArr = [];
//     let imagesArr = {
//         virus: {
//             isImage: false,
//             image: new Image(),
//             load: function () {
//                 this.image.src = "src/images/virus.png";
//                 this.image.onload = () => this.isImage = true;
//             }
//         }
//     };
//
//     imagesArr.virus.load();
//
//     for (let i = 0; i <= mapInfo.foodCount; i++) foodsArr.push(new Food(
//         getIntRandom(10, mapInfo.width),
//         getIntRandom(10, mapInfo.height),
//         5, colors[getIntRandom(0, colors.length - 1)]
//     ));
//     for (let i = 0; i <= mapInfo.spikeCount; i++) spikesArr.push(new Spike(
//         getIntRandom(10, mapInfo.width),
//         getIntRandom(10, mapInfo.height),
//         0, 0,
//         100,
//         true
//     ));
//
//
//     function render() {
//         new Promise(function (resolve) {
//             let time = performance.now();
//
//             if (foodsArr.length < mapInfo.foodCount) {
//                 foodsArr.push(
//                     new Food(getIntRandom(10, mapInfo.width), getIntRandom(10, mapInfo.height), 5, colors[getIntRandom(0, colors.length - 1)])
//                 );
//             }
//             if (spikesArr.length < mapInfo.spikeCount) {
//                 spikesArr.push(new Spike(
//                     getIntRandom(10, mapInfo.width),
//                     getIntRandom(10, mapInfo.height),
//                     0, 0,
//                     20,
//                     true
//                 ));
//             }
//
//             context.clearRect(0, 0, canvas.width, canvas.height);
//
//             for (let i = 0; i < foodsArr.length; i++) {
//                 let food = foodsArr[i];
//                 food.update();
//             }
//             for (let i = 0; i < bulletsArr.length; i++) {
//                 let bullet = bulletsArr[i];
//
//                 let cont = false;
//                 for (let j = 0; j < spikesArr.length; j++) {
//                     let spike = spikesArr[j];
//                     if (Math.sqrt((spike.x - bullet.x) ** 2 + (spike.y - bullet.y) ** 2) <= (spike.radius + bullet.radius - 1)) {
//                         spike.feed(15, bullet.sin, bullet.cos);
//                         bulletsArr.splice(i, 1);
//                         i--;
//                         cont = true;
//                         break;
//                     }
//                 }
//                 if (cont) continue;
//                 bullet.update();
//             }
//             for (let i = 0; i < spikesArr.length; i++) {
//                 let spike = spikesArr[i];
//                 spike.update();
//             }
//             player.update();
//
//             // console.log("TIME: " + (performance.now() - time));
//             resolve();
//         }).then(() => requestAnimationFrame(render));
//     }
//
//     render();
//
//
//     window.addEventListener("keypress", event => {
//         if (event.code.toLowerCase() === "keyw") {
//             if (gameInfo.pause) return true;
//
//             if (player) player.shoot();
//             return true;
//         }
//
//         if (event.code.toLowerCase() === "keyp") {
//             gameInfo.pause = !gameInfo.pause;
//             return true;
//         }
//
//         if (event.code.toLowerCase() === "equal") {
//             if (mapInfo.scale === 2) return false;
//
//             mapInfo.scale++;
//             context.scale(2, 2);
//             context.translate(-canvas.width / 4, -canvas.height / 4);
//         }
//
//         if (event.code.toLowerCase() === "minus") {
//             if (mapInfo.scale === 0) return true;
//
//             mapInfo.scale--;
//             context.scale(0.5, 0.5);
//             context.translate(canvas.width / 2, canvas.height / 2);
//         }
//
//         if (event.code.toLowerCase() === "space") {
//             player.split();
//         }
//
//     });
//
//     // new Promise(() =>{
//     //     let c = 0;
//     //     let time = performance.now();
//     //     for(let i = 0; i < 100000000; i++){
//     //         c++;
//     //     }
//     //     // for(let i = 0; i < 1000; i++){
//     //     //     for(let j = 0; j < 1000; j++){
//     //     //         for(let k = 0; k < 100; k++){
//     //     //             c++;
//     //     //         }
//     //     //     }
//     //     // }
//     //     console.log(c);
//     //     console.log("TIME: " + (performance.now() - time));
//     // });
//
//
// })();


(function () {

    function getRandomInt(min, max) {
        return Math.round((max - min) * Math.random() + min);
    }

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

    function rgbToHex(...rgb) {

        for (let i = 0; i < 3; i++) {
            let hex = Number(rgb[i]).toString(16);
            if (hex.length < 2) hex = "0" + hex;
            rgb[i] = hex;
        }

        return "#" + rgb.join("");
    }

///////////////

    class Arc {

        constructor() {
        }

        render() {
            let drawableX = canvas.width / 2 + (this.x - gameInfo.centerX) / gameInfo.scale;
            let drawableY = canvas.height / 2 + (this.y - gameInfo.centerY) / gameInfo.scale;

            if (drawableX < 0 || drawableX > canvas.width || drawableY < 0 || drawableY > canvas.height) return true;

            context.beginPath();
            context.fillStyle = this.color;
            context.arc(drawableX, drawableY, this.drawableRadius / gameInfo.scale, 0, 2 * Math.PI, false);
            context.fill();
            context.closePath();

            if (this.constructor.name.toLowerCase() === "cell" && this.owner.isImage) {
                context.save();
                context.clip();
                context.globalCompositeOperation = "source-atop";
                context.drawImage(this.owner.image, drawableX - this.drawableRadius / gameInfo.scale, drawableY - this.drawableRadius / gameInfo.scale, this.drawableRadius * 2 / gameInfo.scale, this.drawableRadius * 2 / gameInfo.scale);
                context.restore();
            }

            if (!["food", "bullet"].includes(this.constructor.name.toLowerCase())) {
                context.fillStyle = "#FFFFFF";
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.font = String(this.drawableRadius / (3 * gameInfo.scale)) + "px Verdana";
                context.fillText(String(Math.floor(this.mass)), drawableX, drawableY);
            }

        }

        get drawableRadius() {
            return Math.sqrt(this.mass / Math.PI);
        }

        get radius() {
            let toMass = this.toMass || 0;
            return Math.sqrt((this.mass + toMass) / Math.PI);
        }

        set radius(val) {
            this.mass = Math.round(val * 10);
        }

        get speed() {
            return 1000 / this.mass;
        }

        get mouseDist() {
            let differentX = mouseCoords.x - this.x;
            let differentY = mouseCoords.y - this.y;
            return Math.sqrt(differentX ** 2 + differentY ** 2);
        }

        get timeRatio() {
            return gameInfo.deltaTime / gameInfo.perSecond
        }

        outOfBorder() {
            return (this.x <= 0 || this.x >= gameInfo.width || this.y <= 0 || this.y >= gameInfo.height);
        }

        static drawCompass() {

            context.beginPath();
            context.moveTo(canvas.width / 2, canvas.height / 2);
            context.lineTo(drawableX1 / gameInfo.scale, drawableY1 / gameInfo.scale);
            context.lineWidth = 10;
            context.stroke();
            context.closePath();
        }

        static drawBorder() {
            let arr = [
                [0, 0],
                [gameInfo.width, 0],
                [gameInfo.width, gameInfo.height],
                [0, gameInfo.height]
            ];

            context.beginPath();
            for (let [x, y] of arr) {
                let width = (x - gameInfo.centerX) / gameInfo.scale;
                let height = (y - gameInfo.centerY) / gameInfo.scale;
            }

        };

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

                this.toMass += 50;
                bulletsArr.splice(i, 1);
                i--;

                if (this.mass >= 400) {
                    this.toMass = roundFloor(this.toMass - (this.mass - 200));
                    virusArr.push(
                        new Virus(this.x, this.y, bullet.sin, bullet.cos, 200)
                    )
                }
            }

            rendersArr.push(this);

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
                this.x = roundFloor(this.x + this.cos * speed * this.timeRatio, 2);
                this.y = roundFloor(this.y + this.sin * speed * this.timeRatio, 2);
            }

            if (Math.abs(this.toMass) > 0) {
                let speed = this.toMass * this.timeRatio / 5;
                if (Math.abs(speed) < 1) speed = this.toMass >= 0 ? 1 : -1;
                if (Math.abs(this.toMass) < Math.abs(speed)) speed = this.toMass;

                this.mass = Math.round(this.mass + speed);
                this.toMass = Math.round(this.toMass - speed);
                if(this.main) {
                    gameInfo.byScale += speed / 20000;
                }
                if (this.mass >= 22500) {
                    this.mass = 22500;
                    this.toMass = 0;
                }
            }

            if (Math.abs(this.spaceDistance > 0)) {
                if (this.spaceDistance <= this.totalSpaceDistane / 1.3) this.isCollising = true;
                let speed = this.spaceDistance * this.timeRatio / 15;
                if (Math.abs(speed) < 1) speed = this.spaceDistance >= 0 ? 1 : -1;
                if (Math.abs(speed) > 10) speed = this.spaceDistance >= 0 ? 10 : -10;
                if (Math.abs(this.spaceDistance) < Math.abs(speed)) speed = this.spaceDistance;

                this.x = roundFloor(this.x + speed * this.spaceCos * this.speed, 2);
                this.y = roundFloor(this.y + speed * this.spaceSin * this.speed, 2);
                this.spaceDistance = roundFloor(this.spaceDistance - speed, 2);
            }

            if (Math.abs(this.engineDistance > 0)) {
                let speed = this.engineDistance * this.timeRatio / 2;
                if (Math.abs(speed) < 10) speed = this.engineDistance >= 0 ? 10 : -10;
                if (Math.abs(speed) > 30) speed = this.engineDistance >= 0 ? 30 : -30;
                if (Math.abs(this.engineDistance) < Math.abs(speed)) speed = this.engineDistance;

                this.x = roundFloor(this.x + speed * this.engineCos * this.speed, 2);
                this.y = roundFloor(this.y + speed * this.engineSin * this.speed, 2);
                this.engineDistance = roundFloor(this.engineDistance - speed, 2);
            }

            for (let i = 0; i < bulletsArr.length; i++) {
                let bullet = bulletsArr[i];
                let c = Math.sqrt((this.x - bullet.x) ** 2 + (this.y - bullet.y) ** 2);
                if (this.drawableRadius >= c) {
                    this.toMass += 10;
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
                        new Cell(this.x + distance * cos, this.y + distance * sin, mass, sin, cos, false, this.color, this.owner, this.owner.cells.length, 50)
                    );
                    currentAngle += angleStep;
                    count--;
                    gameInfo.byScale += 0.1;
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

                let distance = roundFloor(Math.sqrt((cell.x - this.x) ** 2 + (cell.y - this.y) ** 2), 2);
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
                    this.owner.cells.splice(i, 1);
                    if (this.owner.updateI > i) {
                        i--;
                        this.owner.updateI--;
                    }
                    gameInfo.byScale -= 0.1;
                    // this.isConnect = false;
                    // setTimeout(() => this.isConnect = true, 100);
                }

            }



            this.updateCenterDrawable();
            rendersArr.push(this);
        }

        updateDirection() {
            let differentX = mouseCoords.x - this.x;
            let differentY = mouseCoords.y - this.y;

            if (Math.abs(differentY) < 1) differentY = 0;
            if (Math.abs(differentX) < 1) differentX = 0;

            let c = Math.sqrt(differentX ** 2 + differentY ** 2);
            this.sin = roundFloor(differentY / c, 2) || 0;
            this.cos = roundFloor(differentX / c, 2) || 0;
        }

        updateCenterDrawable() {
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
            mouseCoords.x = roundFloor(mouseCoords.x + width * gameInfo.scale, 2);
            mouseCoords.y = roundFloor(mouseCoords.y + height * gameInfo.scale, 2);
            gameInfo.centerX = roundFloor(gameInfo.centerX + width, 2);
            gameInfo.centerY = roundFloor(gameInfo.centerY + height, 2);
        }


        split() {
            this.isCollising = true;
            let mass = this.mass + this.toMass;
            if (this.owner.cells.length === 64 || mass <= 250) return true;

            this.isConnect = false;
            setTimeout(() => this.isConnect = true, 1000);

            let height = this.radius * this.sin * 1.1;
            let width = this.radius * this.cos * 1.1;

            this.toMass = Math.floor(this.toMass - mass / 2);

            let distance = 50000 / mass + mass / 10;

            this.owner.cells.push(
                new Cell(roundFloor(this.x + width, 2), roundFloor(this.y + height, 2), mass / 2, this.sin, this.cos, false, this.color, this.owner, this.owner.cells.length, distance)
            );

            gameInfo.byScale += 0.1;
        }


        shoot() {
            if (this.mass + this.toMass < 250) return true;

            bulletsArr.push(
                new Bullet(this.x + (this.radius + 5) * this.cos, this.y + (this.radius + 5) * this.sin, this.sin, this.cos, 150, 200)
            );
            this.toMass -= 10;
        }

    }


    class Player {
        isImage = false;
        image = new Image();

        constructor(x, y, mass, color = "#000000") {
            this.image.onload = () => this.isImage = true;
            this.image.src = "https://avatars.mds.yandex.net/get-pdb/939186/3e8700ba-511c-45e1-b9fb-dc3f02e88ca4/s1200";

            gameInfo.centerX = x;
            gameInfo.centerY = y;
            this.cells = [
                new Cell(x, y, mass, null, null, true, color, this, 0)
            ];

            this.updateI = 0;
        }

        update() {
            this.updateI = 0;
            for (; this.updateI < this.cells.length; this.updateI++) {
                this.cells[this.updateI].update();
                // rendersArr.push(this.cells[this.updateI]);
            }
        }


        split() {
            let length = this.cells.length;
            for (let i = 0; i < length; i++) {
                this.cells[i].split();
            }

        }

        shoot() {
            let length = this.cells.length;
            for (let i = 0; i < length; i++) {
                this.cells[i].shoot();
            }
        }

    }

    ///////////////////


    let canvas = document.getElementById("canvas");
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
    });
    ///////////////


    let gameInfo = {
        centerX: 0,
        centerY: 0,
        width: 1000,
        height: 1000,
        startMass: 500,
        scale: 1,
        byScale: 0,
        updateTime: 0,
        deltaTime: 0,
        perSecond: 1000 / 60,
        food: 500,
        foodMinMass: 50,
        foodMaxMass: 100,
        virus: 0
    };

    let rendersArr = [];
    let bulletsArr = [];
    let virusArr = [];
    let foodsArr = [];
    for (let i = 0; i < gameInfo.virus; i++) {
        virusArr.push(
            new Virus(getRandomInt(10, gameInfo.width - 10), getRandomInt(10, gameInfo.height - 10), 0, 0, 0)
        )
    }
    for (let i = 0; i < gameInfo.food; i++) {
        foodsArr.push(
            new Food(getRandomInt(10, gameInfo.width - 10), getRandomInt(10, gameInfo.height - 10), getRandomInt(gameInfo.foodMinMass, gameInfo.foodMaxMass), rgbToHex(getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255)))
        )
    }

    let player = new Player(getRandomInt(10, gameInfo.width), getRandomInt(10, gameInfo.height), gameInfo.startMass, "#000000");


    function render() {
        new Promise(() => {
            let time = performance.now();
            while (performance.now() - gameInfo.updateTime >= gameInfo.perSecond) {
                gameInfo.deltaTime = performance.now() - gameInfo.updateTime;
                gameInfo.updateTime = performance.now();

                context.clearRect(0, 0, canvas.width, canvas.height);

                if (Math.abs(gameInfo.byScale) > 0) {
                    let speed = gameInfo.byScale * (gameInfo.deltaTime / gameInfo.perSecond) / 10;
                    if (Math.abs(speed) < 0.01) speed = gameInfo.byScale > 0 ? 0.01 : -0.01;
                    if (Math.abs(gameInfo.byScale) < Math.abs(speed)) speed = gameInfo.byScale;

                    gameInfo.scale += speed;
                    gameInfo.byScale -= speed;
                }

                rendersArr = [];
                player.update();

                for (let i = 0; i < bulletsArr.length; i++) {
                    bulletsArr[i].update();
                }

                for (let i = 0; i < virusArr.length; i++) {
                    virusArr[i].update();
                }

                for (let i = 0; i < foodsArr.length; i++) {
                    foodsArr[i].update();
                }

                let renderLength = rendersArr.length;
                rendersArr = rendersArr.sort((a, b) => a.drawableRadius - b.drawableRadius);
                for (let i = 0; i < renderLength; i += 2) {
                    rendersArr[i].render();
                    try {
                        rendersArr[i + 1].render();
                    } catch (e) {
                    }

                }

                // Arc.drawCompass();

                console.log(performance.now() - time);
            }
            requestAnimationFrame(render);
        });


    }

    gameInfo.updateTime = performance.now();
    render();

    let coordsHtml = $("#coords");

    function updateHtml() {
        coordsHtml.text("X: " + Math.floor(gameInfo.centerX * 10) + " Y: " + Math.floor(gameInfo.centerY * 10));
        requestAnimationFrame(updateHtml);
    }

    updateHtml();


    window.addEventListener("keypress", event => {
        if (event.code.toLowerCase() === "space") {
            player.split();
            return true;
        }

        if (event.code.toLowerCase() === "minus") {
            gameInfo.scale = roundFloor(gameInfo.scale + 0.1, 2);
            return true;
        }

        if (event.code.toLowerCase() === "keyw") {
            player.shoot();
            return true;
        }

    });

    {
        let wheel = 0;
        window.addEventListener("wheel", function (event) {
            let byScale = event.deltaY > 0 ? 0.1 : -0.1;
            if (Math.abs(wheel + byScale) > 0.5) return true;

            wheel += byScale;
            gameInfo.byScale += byScale;
        });
    }

})();