const {Worker, parentPort, workerData} = require("worker_threads");
const {Files} = require("./Files");
let Functions = require("../functions");

async function getGameSettings() {
    let file = new Files("game_info.json");
    let fileData = await file.readFile();
    if (Functions.isEmpty(fileData)) {
        fileData = {
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
            virusMaxMass: 400,
            bulletMass: 25,
            bulletEatenCoefficient: 0.7,
            bulletDistance: 100,
            connectTime: 1000,
            connectTimeMassCoefficient: 0.1,
            maxCells: 64,
            maxCellMass: 22500,
            botsCount: 0,
            botsUpdateDirectionInterval: 5000,
            feedingVirusCount: 0,
            feedingVirusStartMass: 400,
            feedingVirusMaxMass: 50000,
            feedingVirusInterval: 1000,
            feedingVirusIntervalCoefficient: 0.01,
            feedingVirusShootCoefficient: 0.1,
            blackHoleCount: 0,
            blackHoleSpeedCoefficient: 2,
            blackHoleStartMass: 5000,
            shootingBlackHoleCount: 0,
            blackHoleShootInterval: 200,
            blackHoleBulletMass: 50,
            blackHoleBulletDistance: 100
        };
        fileData = JSON.stringify(fileData);
        await file.writeFile(fileData);
    }

    return JSON.parse(fileData);
}

parentPort.on("message", async function (data) {
    if (data.action === "load_game_settings") {
        parentPort.postMessage(await getGameSettings());
        return true;
    }

    if (data.action === "update_game_settings") {
        let file = new Files("game_info.json");
        let fileData = await getGameSettings();
        for (let key in data.data) {
            if (!(key in fileData) || isNaN(data.data[key])) continue;
            fileData[key] = +data.data[key];
        }

        await file.writeFile(JSON.stringify(fileData));
        parentPort.postMessage({result: true});
        return true;
    }

});
