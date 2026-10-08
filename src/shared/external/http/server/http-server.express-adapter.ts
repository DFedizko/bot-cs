import express, { type Express, type Request as ExpressRequest, type Response as ExpressResponse } from "express";
import type { Callback, HttpResponse, HttpServer } from "../../../infrastructure/http/http-server";
import { HttpStatus } from "../../../infrastructure/http/http-status";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import { createServer, type Server } from "node:http";
import cookieParser from "cookie-parser";

const ONE_SECOND_IN_MS = 1000;

export class HttpServerExpressAdapter implements HttpServer {
    private readonly app: Express;
    private http: Server;

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.http = createServer(this.app);
    }

    get(path: string, callback: Callback): void {
        this.register(HttpMethod.GET, path, callback);
    }

    post(path: string, callback: Callback): void {
        this.register(HttpMethod.POST, path, callback);
    }

    patch(path: string, callback: Callback): void {
        this.register(HttpMethod.PATCH, path, callback);
    }

    put(path: string, callback: Callback): void {
        this.register(HttpMethod.PUT, path, callback);
    }

    delete(path: string, callback: Callback): void {
        this.register(HttpMethod.DELETE, path, callback);
    }

    listen(port: number): void {
        this.http.listen(port);
    }

    async close(): Promise<void> {
        return new Promise((resolve) => {
            this.http.closeAllConnections();
            this.http.close(() => resolve());
        });
    }

    private register(httpMethod: HttpMethod, path: string, callback: Callback): void {
        this.app[httpMethod]!(path, async (expressRequest: ExpressRequest, expressResponse: ExpressResponse) => {
            const response = await callback({
                body: expressRequest.body,
                headers: expressRequest.headers as Record<string, string>,
                params: expressRequest.params as Record<string, string>,
                searchParams: expressRequest.query as Record<string, string>,
                cookies: expressRequest.cookies ?? {},
            });
            this.setCookies(response, expressResponse);
            this.clearCookies(response, expressResponse);
            expressResponse.status(response.status ?? HttpStatus.OK).set(response.headers ?? {});
            response.body === undefined ? expressResponse.end() : expressResponse.json(response.body);
        });
    }

    private setCookies(httpResponse: HttpResponse, expressResponse: ExpressResponse): void {
        for (const [name, cookie] of Object.entries(httpResponse.cookies ?? {})) {
            expressResponse.cookie(name, cookie.value, {
                ...cookie,
                maxAge: cookie.maxAge && cookie.maxAge * ONE_SECOND_IN_MS,
            });
        }
    }

    private clearCookies(httpResponse: HttpResponse, expressResponse: ExpressResponse): void {
        httpResponse.clearCookies?.forEach((cookieName) => expressResponse.clearCookie(cookieName));
    }
}
