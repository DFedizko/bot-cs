export type HttpHeaders = Readonly<Record<string, string>>;

export type HttpOptions<TBody = unknown, THeaders = HttpHeaders> = {
    body?: TBody;
    headers?: THeaders;
    withCredentials?: boolean;
};

export interface HttpClient {
    get<TResult, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: Omit<HttpOptions<undefined, THeaders>, "body">,
    ): Promise<TResult>;
    post<TResult, TBody = unknown, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: HttpOptions<TBody, THeaders>,
    ): Promise<TResult>;
}
