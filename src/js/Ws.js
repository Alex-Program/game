class Ws {
    isConnect = false;
    address = null;
    message = "";
    isStart = false;

    constructor(address) {
        this.address = address;
        this.listeners = {
            "message": () => "",
            "open": () => ""
        };
        this.connection();
    }

    connection() {
        this.ws = new WebSocket(this.address);
        this.ws.binaryType = "arraybuffer";
    }

    setListeners() {
        this.ws.onmessage = this.listeners.message;
        this.ws.onopen = () => {
            this.isConnect = true;
            this.listeners.open();
        };
        this.ws.onclose = () => {
            this.isConnect = false;
            // this.connection();
            // this.setListeners();
        }
    }

    close() {
        this.ws.close();
    }

    on(event, listener) {
        if (!["message", "open"].includes(event)) return true;
        this.listeners[event] = listener;
        this.setListeners();
    }

    send(message) {
        if (!this.isConnect) return true;
        this.ws.send(message);
    }

    sendJson(message) {
        if (!this.isConnect) return true;
        message.time = Date.now();
        message = JSON.stringify(message);
        message = stringToArrayBuffer(message);
        this.ws.send(message);
    }

}

