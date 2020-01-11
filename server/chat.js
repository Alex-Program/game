const Functions = require('./functions.js');
const {Performance: performance} = require('./GameClasses/Perfromance.js');
const WebSocketServer = require('ws');
const {Chat} = require("./Mysql.js");

// подключенные клиенты
let clients = {};
let clientsSize = 0;


// WebSocket-сервер на порту 8081
const webSocketServer = new WebSocketServer.Server({
    port: 8081
});
let chat = new Chat();
chat.start();


let cachedMessages = [];

async function updateCachedMessages() {
    let isNeedClear = true;
    for (let message of cachedMessages) {
        let result = await chat.insertMessage(message.time, +message.userId, message.message);
        if (!result) {
            isNeedClear = false;
            break;
        }
    }

    if (isNeedClear) cachedMessages = [];
    setTimeout(updateCachedMessages, 300000);
}

setTimeout(updateCachedMessages, 300000);

function wsMessage(data, id = null) {
    data.time = Date.now();
    data = Functions.stringToArrayBuffer(JSON.stringify(data));
    if (id !== null) {
        if (!(+id in clients)) return true;
        clients[id].ws.send(data);
        return true;
    }
    Object.values(clients).forEach(client => client.ws.send(data));
}


function newMessage(id, message) {
    cachedMessages.push({time: Date.now(), userId: clients[id].userId, message});
    let json = {
        action: "message",
        message,
        isAdmin: clients[id].isAdmin,
        id,
        userId: clients[id].userId,
        nick: clients[id].nick
    };
    wsMessage(json);
}

async function authUser(id) {
    let json = {
        action: "get_account_info",
        token: clients[id].token,
        userId: clients[id].userId
    };
    await Functions.sendRequest("api/admin", json)
        .then(data => {
            if (data.result === "true" && !+data.data.is_banned) {
                clients[id].isAuth = true;
                clients[id].isAdmin = +data.data.is_admin;
                clients[id].nick = data.data.name;
            }
            return true;
        });

    afterAuth(id);
}


function afterAuth(id) {

    let obj = {
        action: "get_all_users",
        users: Object.entries(clients).map(arr => ({id: arr[0], userId: arr[1].userId, nick: arr[1].nick}))
    };
    wsMessage(obj, id);
    wsMessage({action: "player_connect", userId: clients[id].userId, nick: clients[id].nick, id});
}

webSocketServer.on('connection', function (ws) {
    let id = clientsSize;
    clientsSize++;
    clients[id] = {
        ws,
        isAuth: false,
        userId: null,
        token: null,
        isAdmin: 0,
        nick: "",
        lastChatMessageTime: performance.now()
    };

    ws.on("close", function () {
        delete clients[id];
    });

    ws.on("message", async function (message) {
        let data = Functions.arrayBufferToString(message);
        try {
            data = JSON.parse(message);
            if (typeof (data) !== "object") throw("Error");
        } catch (e) {
            return true;
        }

        if (data.action === "auth") {
            if (Functions.isEmpty(data.token) || Functions.isEmpty(data.userId)) return true;
            if (Object.values(clients).some(client => client.userId === +data.userId)) {
                clients[id].ws.close();
                return true;
            }

            [clients[id].token, clients[id].userId] = [data.token, +data.userId];
            await authUser(id);
            newMessage(id, "присоединился к чату");

            return true;
        }

        if (!clients[id].isAuth) return true;

        if (data.action === "message") {
            if (performance.now() - clients[id].lastChatMessageTime < 3000) return true;
            clients[id].lastChatMessageTime = performance.now();
            if (Functions.isEmpty(data.message)) return true;
            newMessage(id, data.message);
            return true;
        }

    });


});