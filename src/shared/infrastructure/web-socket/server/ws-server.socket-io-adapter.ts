import type { Socket, WsServer } from "./ws-server";
import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import type { AddressInfo } from "node:net";

export class WsServerSocketIoAdapter implements WsServer {
    private readonly server: Server;

    constructor(readonly httpServer: HttpServer) {
        this.server = new Server(httpServer);
    }

    on(_event: "connection" | string, callback: (socket: Socket) => void): void {
        this.server.on("connection", (socket) => {
            callback({ send: (event, data) => socket.emit(event, data) });
        });
    }

    emit<T = unknown>(event: string, data: T): void {
        this.server.emit(event, data);
    }

    async close(): Promise<void> {
        await this.server.close();
    }

    get port(): number {
        return (this.httpServer.address() as AddressInfo).port;
    }
}
