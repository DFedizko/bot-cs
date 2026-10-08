import { HttpStatus } from "./http-status";

export type Cookie = {
    value: string;
    maxAge?: number; // in seconds
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
};

export type HttpRequest = {
    params: Record<string, string>;
    searchParams: Record<string, string>;
    headers: Record<string, string>;
    cookies: Record<string, string>;
    body: unknown;
};

export type HttpResponse = {
    status?: HttpStatus;
    body?: unknown;
    headers?: Record<string, string>;
	cookies?: Record<string, Cookie>;
	clearCookies?: string[];
};

export type Callback = (req: HttpRequest) => HttpResponse | Promise<HttpResponse>;

export interface HttpServer {
    get(path: string, callback: Callback): void;
    post(path: string, callback: Callback): void;
    patch(path: string, callback: Callback): void;
    put(path: string, callback: Callback): void;
    delete(path: string, callback: Callback): void;
	listen(port: number): void;
	close(): Promise<void>;
}
