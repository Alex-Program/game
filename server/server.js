const WebSocketServer = require('ws');
const Functions = require('./functions.js');
const Units = require('./GameClasses/Units.js');
// подключенные клиенты
let clients = {};
let clientsSize = 0;

// WebSocket-сервер на порту 8081
const webSocketServer = new WebSocketServer.Server({
    port: 8081
});


function wsMessage(message, id = null, besidesId = null) {
    if (!message.time) message.time = Date.now();
    message = JSON.stringify(message);
    if (id !== null){
        if(!clients.hasOwnProperty(id)) return false;
        return clients[id].ws.send(message);
    }

    for (let wsId in clients) {
        if (!clients.hasOwnProperty(wsId)) continue;

        if (besidesId !== null && +wsId === +besidesId) continue;
        clients[wsId].ws.send(message);
    }

}

Units.game.onSpawnUnit = function (unit) {

    unit = Units.game.getUnit(unit);
    let message = {
        action: "spawn_unit",
        ...unit
    };
    if (message.name === "player") {
        message.current = "false";
        wsMessage(message, null, message.id);
        message.current = "true";
        wsMessage(message, message.id);

        return true;
    }

    wsMessage(message);
};
Units.game.startGame();

console.log("ds");
webSocketServer.on('connection', function (ws) {
    console.log("player connect");
    let id = clientsSize;
    clientsSize++;
    clients[id] = {};
    clients[id].ws = ws;
    clients[id].isAdmin = false;
    clients[id].isVerefied = false;
    clients[id].isConnect = false;

    ws.on('message', function (data) {
        try {
            data = JSON.parse(data);
        } catch (e) {
            return true;
        }

        if (data.action === "player_connect") {
            if (!data.color) data.color = Functions.rgbToHex(Functions.getRandomInt(0, 255), Functions.getRandomInt(0, 255), Functions.getRandomInt(0, 255));
            Units.game.playerConnect(id, data.color);
            return true;
        }
        if (data.action === "get_all_units") {
            // if (!clients[id].isConnect) return true;

            let arr = Units.game.getAllUnits();

            wsMessage({units: arr, action: "get_all_units"}, id);
        }
        if (data.action === "mouse_move") {
            Units.game.mouseMove(id, data.x, data.y, data.time);
            wsMessage({
                action: "mouse_move",
                x: data.x,
                y: data.y,
                id
            });
        }
        if (data.action === "player_shoot") {
            Units.game.shoot(id, data.time);
            return true;
        }
        if (data.action === "player_split") {
            Units.game.split(id, data.time);
            wsMessage({
                action: "player_split",
                id,
                time: data.time
            });
            return true;
        }
        if (data.action === "update_units") {
            let time = Date.now();
            let arr = Units.game.getAllUnits();
            wsMessage({
                action: "update_units",
                units: arr,
                time
            }, id);
        }

        if (data.action === "chat_message") {
            if (!data.message) return true;
            let player = Units.game.findPlayer(id);
            if (!player) return true;
            player = player.player;
            let pm = +data.pm;
            let json = {
                action: "chat_message",
                message: data.message,
                nick: player.nick,
                color: player.color,
                // isAdmin: 1,
                pm,
                id
            };
            if (pm) {
                wsMessage(json, +data.pmId);
                if(+data.pmId !== id) wsMessage(json, id);
            } else wsMessage(json);

            return true;
        }
    });

    setInterval(() => {
        wsMessage({action: "ping"});
    }, 1000);

    ws.on('close', function () {
        delete clients[id];

        Units.game.playerDisconnect(id);
        wsMessage({action: "player_disconnect", id: id});
    });

});