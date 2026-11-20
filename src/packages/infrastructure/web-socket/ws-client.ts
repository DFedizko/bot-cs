export interface WsClient {
    on<T = unknown>(event: "connect" | string, callback: (data: T) => void): void;
    emit<T = unknown>(event: string, data: T): void;
    close(): void;
}
