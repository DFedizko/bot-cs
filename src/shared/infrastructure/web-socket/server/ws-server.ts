export type Socket = {
    on(event: string, callback: (data: any) => void): void;
    emit<T = unknown>(event: string, data: T): void;
};

export interface WsServer {
    on(event: "connection" | string, callback: (socket: Socket) => void): void;
    emit<T = unknown>(event: string, data: T): void;
    close(): Promise<void>;
    port: number;
}
