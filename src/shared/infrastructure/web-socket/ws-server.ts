export type Socket = {
    send<T = unknown>(event: string, data: T): void;
};

export interface WsServer {
    on(event: "connection", callback: (socket: Socket) => void): void;
    emit<T = unknown>(event: string, data: T): void;
    close(): Promise<void>;
}
