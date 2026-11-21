import type { HttpRoute } from "./docs/http-route.doc";
import type { HttpRouteCatalog } from "./docs/http-route.catalog";
import { HttpMethod } from "./http-method";
import type { Callback, HttpRouteOptions, HttpServer } from "./http-server";

export class HttpServerRouteRecordingDecorator implements HttpServer, HttpRouteCatalog {
    private readonly recorded: HttpRoute[] = [];

    constructor(private readonly server: HttpServer) {}

    get(path: string, callback: Callback, options?: HttpRouteOptions): void {
        this.record(HttpMethod.GET, path, options);
        this.server.get(path, callback, options);
    }

    post(path: string, callback: Callback, options?: HttpRouteOptions): void {
        this.record(HttpMethod.POST, path, options);
        this.server.post(path, callback, options);
    }

    patch(path: string, callback: Callback, options?: HttpRouteOptions): void {
        this.record(HttpMethod.PATCH, path, options);
        this.server.patch(path, callback, options);
    }

    put(path: string, callback: Callback, options?: HttpRouteOptions): void {
        this.record(HttpMethod.PUT, path, options);
        this.server.put(path, callback, options);
    }

    delete(path: string, callback: Callback, options?: HttpRouteOptions): void {
        this.record(HttpMethod.DELETE, path, options);
        this.server.delete(path, callback, options);
    }

    listen(port: number, callback?: () => void): void {
        this.server.listen(port, callback);
    }

    close(): Promise<void> {
        return this.server.close();
    }

    routes(): HttpRoute[] {
        return [...this.recorded];
    }

    private record(method: HttpMethod, path: string, options?: HttpRouteOptions): void {
        this.recorded.push({ method, path, ...options });
    }
}
