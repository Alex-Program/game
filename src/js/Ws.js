class Ws{
    constructor(address){
        this.address = address;
        this.listeners ={
            "message": () => "",
            "open": () => ""
        };
        this.connection();
    }

    connection(){
        this.ws = new WebSocket(this.address);
    }

    setListeners(){
        this.ws.onmessage = this.listeners.message;
        this.ws.onopen = this.listeners.open;
        this.ws.onclose = () =>{
            this.connection();
            this.setListeners();
        }
    }

    on(event, listener){
        if(!["message", "open"].includes(event)) return true;
        this.listeners[event] = listener;
        this.setListeners();
    }

    send(message){
        this.ws.send(message);
    }

}

