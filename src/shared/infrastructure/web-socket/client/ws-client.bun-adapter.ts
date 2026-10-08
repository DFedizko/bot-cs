import type { WsClient, WsClientOptions } from "./ws-client";

type Callback = (data: any) => void;

export class WsClientBunAdapter implements WsClient {
    private readonly ws: WebSocket;
    private readonly callbacks = new Map<string, Callback[]>();
    private readonly queue: string[] = [];

    constructor(url: string, options?: WsClientOptions) {
        this.ws = new WebSocket(url, options);
        this.ws.addEventListener("open", () => {
            this.flush();
            this.trigger("connect");
        });
        this.ws.addEventListener("close", () => this.trigger("disconnect"));
        this.ws.addEventListener("message", (event) => this.dispatch(String(event.data)));
    }

    on(event: "connect" | string, callback: Callback): void {
        const list = this.callbacks.get(event) ?? [];
        list.push(callback);
        this.callbacks.set(event, list);
    }

    emit<T = unknown>(event: string, data?: T): void {
        const msg = JSON.stringify({ event, data });
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(msg);
            return;
        }
        this.queue.push(msg);
    }

    close(): void {
        this.ws.close();
    }

    private flush(): void {
        this.queue.splice(0).forEach((msg) => this.ws.send(msg));
    }

    private trigger(event: "connect" | "disconnect" | string, data?: unknown): void {
        this.callbacks.get(event)?.forEach((callback) => callback(data));
    }

    private dispatch(raw: string): void {
        const { event, data } = JSON.parse(raw);
        this.trigger(event, data);
    }
}
