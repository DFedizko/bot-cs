import { io, type Socket } from "socket.io-client";
import type { WsClient } from "./ws-client";

export class WsClientSocketIoAdapter implements WsClient {
    private readonly socket: Socket;

    constructor(url: string) {
        this.socket = io(url);
    }

    emit<T = unknown>(event: string, data: T): void {
        this.socket.emit(event, data);
    }

    on(event: "connect" | string, callback: (data: any) => void): void {
        this.socket.on(event, callback);
    }

    close(): void {
        this.socket.close();
    }
}
