const WebSocketServer = require('ws');
const Functions = require('./functions.js');
const {isEmpty} = Functions;
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
    message = Functions.stringToArrayBuffer(message);
    if (id !== null) {
        if (!clients.hasOwnProperty(id)) return false;
        return clients[id].ws.send(message);
    }

    for (let wsId in clients) {
        if (!clients.hasOwnProperty(wsId)) continue;

        if (besidesId !== null && +wsId === +besidesId) continue;
        clients[wsId].ws.send(message);
    }

}

function wsModerMessage(message) {
    for (let i = 0; i < Units.game.playersArr.length; i++) {
        let player = Units.game.playersArr[i];
        if (!player.isModer && !player.isAdmin) continue;
        wsMessage(message, player.wsId);
    }
}


class Command {
    adminsCommand = {
        add_mass: this.addMass,
        break_player: this.breakPlayer,
        mute: this.mutePlayer
    };


    sendCommand(id, command, params) {
        let player = Units.game.findPlayer(id);
        if (!player) return false;
        player = player.player;
        if (command in this.adminsCommand && !player.isAdmin) return false;

        let allCommands = {...this.adminsCommand};
        if (!(command in allCommands)) return false;
        allCommands[command](id, params);
    }

    mutePlayer(id, params) {
        if (Functions.isEmpty(params.target_id)) return false;

        let target = Units.game.findPlayer(params.target_id);
        if (!target) return false;
        target = target.player;
        // if (target.isAdmin) return false;

        let current = Units.game.findPlayer(id);
        if (!current) return false;
        current = current.player;

        if (target.isModer && !current.isAdmin) return false;
        clients[params.target_id].isMute = true;

        wsModerMessage({action: "game_message", message: current.nick + " выдал мут игроку " + target.nick});
    }

    addMass(id, params) {
        if (isEmpty(params.mass)) params.mass = 1000;
        if (isEmpty(params.to_id)) params.to_id = id;
        Units.game.addMass(params.to_id, params.mass);
    }

    breakPlayer(id, params) {
        if (isEmpty(params.to_id)) params.to_id = id;
        Units.game.breakPlayer(params.to_id);
    }
}

let command = new Command();

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

        let player = Units.game.findPlayer(message.id);
        if (!player) return true;
        player = player.player;
        message = {
            action: "nick_info",
            is_moder: +player.isModer,
            is_admin: +player.isAdmin
        };
        wsMessage(message, player.wsId);
        chatMessage(player.wsId, "вошел в игру", 0, 0, true);
        return true;
    }

    wsMessage(message);
};
Units.game.startGame();

function chatMessage(id, message, pm, pmId, isSecondary = false) {
    let player = Units.game.findPlayer(id);
    if (!player) return true;
    player = player.player;
    pm = +pm;
    pmId = +pmId;
    let json = {
        action: "chat_message",
        message: message,
        nick: player.nick,
        color: player.color,
        isAdmin: player.isAdmin,
        isSecondary: +isSecondary,
        pm,
        id
    };
    if (pm) {
        wsMessage(json, pmId);
        if (pmId !== id) wsMessage(json, id);
    } else wsMessage(json);
}

// function updateUnits() {
//     let time = Date.now();
//     let arr = Units.game.getAllUnits();
//     wsMessage({
//         action: "update_units",
//         units: arr,
//         time
//     });
//
//     setTimeout(updateUnits, 1000);
// }
//
// setTimeout(updateUnits, 0);


webSocketServer.on('connection', function (ws, req) {
    console.log("player connect");
    let id = clientsSize;
    clientsSize++;
    clients[id] = {};
    clients[id].ws = ws;
    clients[id].isAdmin = false;
    clients[id].isVerefied = false;
    clients[id].isConnect = false;
    clients[id].isMute = false;
    clients[id].IPAddress = req.connection.remoteAddress || ws._socket.remoteAddress;

    ws.on('message', async function (data) {
        data = Functions.arrayBufferToString(data).split("").filter(val => val !== String.fromCharCode(0)).join("");
        try {
            data = JSON.parse(data);
        } catch (e) {
            console.log(data.charCodeAt(2));
            return true;
        }

        if (data.action === "player_connect") {
            if (!data.color) data.color = Functions.rgbToHex(Functions.getRandomInt(0, 255), Functions.getRandomInt(0, 255), Functions.getRandomInt(0, 255));
            Units.game.playerConnect(id, data.color, data.nick || "SandL");
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
                units: {players: arr.players},
                time
            }, id);
        }

        if (data.action === "chat_message") {
            if (clients[id].isMute) return true;
            if (!data.message) return true;
            chatMessage(id, data.message, +data.pm, +data.pmId);

            return true;
        }

        if (data.action === "send_command") {
            if (!data.command) return true;

            let player = Units.game.findPlayer(id);
            if (!player) return true;
            player = player.player;
            if (!player.isModer && !player.isAdmin) return true;

            let cmd = data.command;
            delete data.command;
            command.sendCommand(id, cmd, data);
        }

        if (data.action === "select_sticker_set") {
            if (Functions.isEmpty(data.id)) return true;

            Functions.sendRequest("api/admin", {action: "get_sticker_set", id: data.id})
                .then(data => {
                    wsMessage({action: "select_sticker_set", id, stickers: data.data.stickers});
                });
        }

        if (data.action === "change_nick") {
            if (Functions.isEmpty(data.nick)) data.nick = "SandL";
            await Units.game.changeNick(id, data.nick);
            let player = Units.game.findPlayer(id);
            if (!player) return true;

            player = player.player;
            wsMessage({
                action: "change_nick",
                id: player.wsId,
                nick: player.nick,
                skin: player.skin,
                skinId: player.skinId
            })
        }
        if (data.action === "select_sticker") {
            if (Functions.isEmpty(data.number)) data.number = "";

            wsMessage({
                action: "select_sticker",
                id,
                number: data.number
            })
        }

        if (data.action === "change_color") {
            if (Functions.isEmpty(data.color)) return true;

            Units.game.changeColor(id, data.color);
            wsMessage({
                action: "change_color",
                id,
                color: data.color
            });
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