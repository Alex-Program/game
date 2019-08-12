function k() {
    let time = Date.now();
    let c = 0;
    for (let i = 0; i < 100000000; i += 3) {
        try {
            c++;
            c++;
            c++;
        } catch (e) {
        }
    }
    console.log(Date.now() - time);
    k();
}

k();

const WebSocketServer = require('ws');

// подключенные клиенты
let clients = {};
let clientsSize = 0;


// WebSocket-сервер на порту 8081
const webSocketServer = new WebSocketServer.Server({
    port: 8081
});


function wsMessage(message) {
    for (let client of Object.values(clients)) {
        client.ws.send(message)
    }
}


class Message {


    static getMessage(id, data) {
        if (!data.message) return true;
        let json = {
            action: "send_message",
            data: {
                message: data.message,
                isAdmin: Number(clients[id].isAdmin),
                name: clients[id].name,
                isVerified: Number(clients[id].isVerified)
            }
        };
        json = JSON.stringify(json);
        wsMessage(json);
    }

}


webSocketServer.on('connection', function (ws) {
    console.log("sdfds");
    let id = clientsSize;
    clientsSize++;
    clients[id] = {};
    clients[id].ws = ws;
    clients[id].name = "Merlin";
    clients[id].isAdmin = true;
    clients[id].isVerified = true;

    ws.on('message', function (data) {
        try {
            data = JSON.parse(data);
        } catch (e) {
            return true;
        }

        if (data.action === "send_message") Message.getMessage(id, data.data);

    });


    ws.on('close', function () {
        delete clients[id];
    });

});