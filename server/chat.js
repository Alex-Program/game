const WebSocketServer = require('ws');

// подключенные клиенты
let clients = {};
let clientsSize = -1;


// WebSocket-сервер на порту 8081
const webSocketServer = new WebSocketServer.Server({
    port: 8081
});


function sendMessage(data, id) {
    for (let [clientId, client] of Object.entries(clients)) {
        if (Number(clientId) === Number(id)) data.from = "from";
        client.ws.send(JSON.stringify(data));
    }
}


webSocketServer.on('connection', function (ws) {
    clientsSize++;
    let id = clientsSize;
    clients[id] = {};
    clients[id].ws = ws;
    clients[id].isAuth = false;
    clients[id].userName = "Spectator";

    ws.on("message", function (message) {
        let data = "";
        try {
            data = JSON.parse(message);
            if (typeof (data) !== "object") throw("Error");
        } catch (e) {
            return true;
        }

        if (data.action === "message") {
            data.from = "to";
            data.userName = clients[id].userName;
            sendMessage(data, id);
            return true;
        }

    });


    ws.on("close", function () {
        delete clients[id];
        if (Object.keys(clients).length === 0) clientsSize = -1;
    })

});