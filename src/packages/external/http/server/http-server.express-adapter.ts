import express, {
    type ErrorRequestHandler,
    type Express,
    type Request as ExpressRequest,
    type Response as ExpressResponse,
} from "express";
import type { Callback, HttpRequest, HttpResponse, HttpServer } from "../../../infrastructure/http/http-server";
import { HttpStatus } from "../../../infrastructure/http/http-status";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import { createServer, type Server } from "node:http";
import cookieParser from "cookie-parser";
import type { HttpHeaders } from "@/packages/infrastructure/http/http-headers";
import type { HttpErrorMapper } from "../../../infrastructure/http/http-error.mapper";
import { HttpErrorMapperByErrorClass } from "../../../infrastructure/http/http-error.mapper.by-error-class";
import { MalformedBodyError } from "../../../infrastructure/http/errors/malformed-body.error";

const ONE_SECOND_IN_MS = 1000;
const BODY_PARSE_FAILED = "entity.parse.failed";

export class HttpServerExpressAdapter implements HttpServer {
    private readonly app: Express;
    readonly http: Server;

    constructor(private readonly errorMapper: HttpErrorMapper = new HttpErrorMapperByErrorClass()) {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(this.answerBodyError);
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

    listen(port: number, callback?: () => void): void {
        this.http.listen(port, callback);
    }

    async close(): Promise<void> {
        return new Promise((resolve) => {
            this.http.closeAllConnections();
            this.http.close(() => resolve());
        });
    }

    private register(httpMethod: HttpMethod, path: string, callback: Callback): void {
        this.app[httpMethod]!(path, (expressRequest: ExpressRequest, expressResponse: ExpressResponse) =>
            this.handle(expressRequest, expressResponse, callback),
        );
    }

    private async handle(
        expressRequest: ExpressRequest,
        expressResponse: ExpressResponse,
        callback: Callback,
    ): Promise<void> {
        try {
            this.respond(await callback(this.toHttpRequest(expressRequest)), expressResponse);
        } catch (error) {
            this.respond(this.errorMapper.map(error), expressResponse);
        }
    }

    private readonly answerBodyError: ErrorRequestHandler = (error, _expressRequest, expressResponse, next) => {
        if (error?.type !== BODY_PARSE_FAILED) return next(error);
        this.respond(this.errorMapper.map(new MalformedBodyError()), expressResponse);
    };

    private toHttpRequest(expressRequest: ExpressRequest): HttpRequest {
        return {
            body: expressRequest.body,
            headers: expressRequest.headers as HttpHeaders,
            params: expressRequest.params as Record<string, string>,
            searchParams: expressRequest.query as Record<string, string>,
            cookies: expressRequest.cookies ?? {},
        };
    }

    private respond(response: HttpResponse, expressResponse: ExpressResponse): void {
        this.setCookies(response, expressResponse);
        this.clearCookies(response, expressResponse);
        expressResponse.status(response.status ?? HttpStatus.OK).set(response.headers ?? {});
        if (response.body === undefined) {
            expressResponse.end();
        } else if (typeof response.body === "string") {
            expressResponse.send(response.body);
        } else {
            expressResponse.json(response.body);
        }
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
