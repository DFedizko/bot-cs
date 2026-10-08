export type WsClientOptions = {
    headers?: Record<string, string>;
};

export interface WsClient {
    on(event: "connect" | string, callback: (data: any) => void): void;
    emit<T = unknown>(event: string, data: T): void;
    close(): void;
}
