import { definePort } from "../define-port";

export type HttpHeaders = Readonly<Record<string, string>>;

export type HttpQuery = Readonly<Record<string, string | number | boolean | undefined>>;

export type HttpClientOptions = {
    defaultHeaders?: HttpHeaders;
};

export type HttpOptions<TBody = unknown, THeaders extends HttpHeaders = HttpHeaders> = {
    body?: TBody;
    headers?: THeaders;
    query?: HttpQuery;
};

export type HttpReadOptions<THeaders extends HttpHeaders = HttpHeaders> = Omit<
    HttpOptions<undefined, THeaders>,
    "body"
>;

export abstract class HttpClient {
    abstract get<TResult, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: HttpReadOptions<THeaders>,
    ): Promise<TResult>;
    abstract post<TResult, TBody = unknown, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: HttpOptions<TBody, THeaders>,
    ): Promise<TResult>;
    abstract put<TResult, TBody = unknown, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: HttpOptions<TBody, THeaders>,
    ): Promise<TResult>;
    abstract patch<TResult, TBody = unknown, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: HttpOptions<TBody, THeaders>,
    ): Promise<TResult>;
    abstract delete<TResult, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: HttpReadOptions<THeaders>,
    ): Promise<TResult>;
}

export const { Provider: HttpClientProvider, usePort: useHttpClient } = definePort<HttpClient>(HttpClient.name);
