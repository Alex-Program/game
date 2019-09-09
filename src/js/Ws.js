class Ws {
    isConnect = false;

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
    }

    setListeners() {
        this.ws.onmessage = this.listeners.message;
        this.ws.onopen = () => {
            this.isConnect= true;
            this.listeners.open();
        };
        this.ws.onclose = () => {
            this.isConnect = false;
            this.connection();
            this.setListeners();
        }
    }

    on(event, listener) {
        if (!["message", "open"].includes(event)) return true;
        this.listeners[event] = listener;
        this.setListeners();
    }

    send(message) {
        if(!this.isConnect) return true;
        this.ws.send(message);
    }

    sendJson(message) {
        if(!this.isConnect) return true;
        message.time = Date.now();
        message = JSON.stringify(message);
        this.ws.send(message);
    }

}

