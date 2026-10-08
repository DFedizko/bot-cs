import type { HttpHeaders } from "./http-headers";

export type HttpOptions<TBody = unknown, THeaders = HttpHeaders> = {
    body?: TBody;
    headers?: THeaders;
    withCredentials?: boolean;
};

export abstract class HttpClient {
    protected cookies = new Map<string, string>();
    abstract get<TResult, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: Omit<HttpOptions<undefined, THeaders>, "body">,
    ): Promise<TResult>;
    abstract post<TResult, TBody = unknown, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: HttpOptions<TBody, THeaders>,
    ): Promise<TResult>;
    abstract patch<TResult, TBody = unknown, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: HttpOptions<TBody, THeaders>,
    ): Promise<TResult>;
    abstract put<TResult, TBody = unknown, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: HttpOptions<TBody, THeaders>,
    ): Promise<TResult>;
    abstract delete<TResult, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: Omit<HttpOptions<undefined, THeaders>, "body">,
    ): Promise<TResult>;

    protected storeCookies(setCookies: string[]) {
        for (const raw of setCookies) {
            const [name, value] = raw.split(";")[0].split("=");
            value ? this.cookies.set(name, value) : this.cookies.delete(name);
        }
    }

    protected cookieHeader(): string {
        return [...this.cookies].map(([n, v]) => `${n}=${v}`).join("; ");
    }
}
