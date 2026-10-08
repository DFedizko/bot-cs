import type { HttpHeaders } from "../http/http-headers";

export type Socket = {
    on(event: string, callback: (data: any) => void): void;
    emit<T = unknown>(event: string, data: T): void;
    headers: HttpHeaders;
};

export interface WsServer {
    on(event: "connection" | string, callback: (socket: Socket) => void): void;
    emit<T = unknown>(event: string, data: T): void;
}
