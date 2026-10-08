import { WsServerBunAdapter } from "../../web-socket/server/ws-server.bun-adapter";
import type { Callback, HttpResponse, HttpServer } from "../../../infrastructure/http/http-server";
import { HttpStatus } from "../../../infrastructure/http/http-status";

type BunCallback = (req: Bun.BunRequest) => Promise<Response>;

export class HttpServerBunAdapter implements HttpServer {
    private routes: Record<string, Partial<Record<Bun.Serve.HTTPMethod, BunCallback>>> = {};
    private server?: Bun.Server<undefined>;

    constructor(private readonly ws?: WsServerBunAdapter) {}

    get(path: string, callback: Callback): void {
        this.register("GET", path, callback);
    }
    post(path: string, callback: Callback): void {
        this.register("POST", path, callback);
    }
    patch(path: string, callback: Callback): void {
        this.register("PATCH", path, callback);
    }
    put(path: string, callback: Callback): void {
        this.register("PUT", path, callback);
    }
    delete(path: string, callback: Callback): void {
        this.register("DELETE", path, callback);
    }

    listen(port: number): void {
        this.server = Bun.serve({
            port,
            routes: {
                ...this.routes,
                "/*": () => new Response("Not found", { status: HttpStatus.NOT_FOUND }),
            },
            fetch: (req, server) => {
                if (this.ws && server.upgrade(req)) return;
                return new Response("Upgrade failed", { status: HttpStatus.INTERNAL_SERVER_ERROR });
            },
            websocket: this.ws?.websocket ?? { message() {} },
        });
        this.ws?.attatch(this.server);
    }

    async close(): Promise<void> {
        await this.server?.stop(true);
    }

    private register(method: Bun.Serve.HTTPMethod, path: string, callback: Callback): void {
        this.routes[path] = {
            ...this.routes[path],
            [method]: (req: Bun.BunRequest) => this.handle(req, callback),
        };
    }

    private async handle(req: Bun.BunRequest, callback: Callback): Promise<Response> {
        const res = await callback({
            params: req.params,
            searchParams: Object.fromEntries(new URL(req.url).searchParams),
            headers: Object.fromEntries(req.headers),
            cookies: Object.fromEntries(req.cookies),
            body: await this.readBody(req),
        });
        this.setCookies(req, res);
        this.clearCookies(req, res);
        const init = { status: res.status ?? HttpStatus.OK, headers: res.headers };
        return res.body === undefined ? new Response(null, init) : Response.json(res.body, init);
    }

    private async readBody(req: Request): Promise<unknown> {
        if (!req.body) return undefined;
        const type = req.headers.get("content-type") ?? "";
        if (type.includes("application/json")) return req.json();
        if (type.includes("form")) return Object.fromEntries(await req.formData());
        return req.text();
    }

    private setCookies(req: Bun.BunRequest, res: HttpResponse): void {
        for (const [name, cookie] of Object.entries(res.cookies ?? {})) {
            req.cookies.set(name, cookie.value, cookie);
        }
    }

    private clearCookies(req: Bun.BunRequest, res: HttpResponse): void {
        res.clearCookies?.forEach((cookieName) => req.cookies.delete(cookieName));
    }
}
