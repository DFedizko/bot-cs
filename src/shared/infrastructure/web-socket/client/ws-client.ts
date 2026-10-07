export interface WsClient {
    on(event: "connect" | string, callback: (data: unknown) => void): void;
    emit<T = unknown>(event: string, data: T): void;
    close(): void;
}
