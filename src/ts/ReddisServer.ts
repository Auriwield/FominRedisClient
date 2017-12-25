import {Config} from "./Config";

export class ReddisServer {
    private socket : WebSocket;
    private _onTextReceived: (response: string) => void;
    isReady : boolean = false;
    isConnecting : boolean = false;
    onReady : () => void;

    constructor() {
        this.isConnecting = true;
        this.socket = new WebSocket(Config.ReddisServerUrl);
        this.socket.onmessage = (evt) => {
            if (!evt.data) {
                return;
            }

            this._onTextReceived(evt.data);
        };

        this.socket.onopen = () => {
            this.isReady = true;
            this.isConnecting = false;
            if (this.onReady) this.onReady();
        };


        this.socket.onclose = () => {
            this.isReady = false;
            this.isConnecting = false;
        }
    }

    set onTextReceived(value: (response: string) => void) {
        this._onTextReceived = value;
    }

    send(command: string) {
        if (!command) {
            return;
        }

        this.socket.send(command);
    }
}