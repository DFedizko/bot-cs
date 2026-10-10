import { HttpClient, type HttpOptions } from "../../../infrastructure/http/http-client";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import { HttpError } from "../../../infrastructure/http/errors/http.error";
import { InternalServerError } from "../../../infrastructure/http/errors/internal-server.error";
import type { HttpHeaders } from "@/shared/infrastructure/http/http-headers";

export class HttpClientFetchAdapter extends HttpClient {
    constructor(
        private readonly baseUrl: string,
        private readonly options?: { keepAlive?: boolean },
    ) {
        super();
    }

    async get<TResult, THeaders extends HttpHeaders = Readonly<Record<string, string>>>(
        path: string,
        options?: HttpOptions<undefined, THeaders>,
    ): Promise<TResult> {
        return await this.request(HttpMethod.GET, path, options);
    }

    async post<TResult, TBody = unknown, THeaders extends HttpHeaders = Readonly<Record<string, string>>>(
        path: string,
        options?: HttpOptions<TBody, THeaders>,
    ): Promise<TResult> {
        return await this.request(HttpMethod.POST, path, options);
    }

    async patch<TResult, TBody = unknown, THeaders extends HttpHeaders = Readonly<Record<string, string>>>(
        path: string,
        options?: HttpOptions<TBody, THeaders>,
    ): Promise<TResult> {
        return await this.request(HttpMethod.PATCH, path, options);
    }

    async put<TResult, TBody = unknown, THeaders extends HttpHeaders = Readonly<Record<string, string>>>(
        path: string,
        options?: HttpOptions<TBody, THeaders>,
    ): Promise<TResult> {
        return await this.request(HttpMethod.PUT, path, options);
    }

    async delete<TResult, THeaders extends HttpHeaders = Readonly<Record<string, string>>>(
        path: string,
        options?: Omit<HttpOptions<undefined, THeaders>, "body">,
    ): Promise<TResult> {
        return await this.request(HttpMethod.DELETE, path, options);
    }

    private async request<TResult, TBody = unknown, THeaders extends HttpHeaders = HttpHeaders>(
        method: HttpMethod,
        path: string,
        options?: HttpOptions<TBody, THeaders>,
    ): Promise<TResult> {
        try {
            const cookie = options?.headers?.cookie ?? this.cookieHeader();
            const response = await fetch(`${this.baseUrl}${this.resolvePathPrefix(path)}`, {
                method: method.toUpperCase(),
                ...(options?.body && { body: JSON.stringify(options.body) }),
                headers: {
                    ...options?.headers,
                    ...(options?.body && { "Content-Type": "application/json" }),
                    ...(cookie && { cookie }),
                },
                keepalive: this.options?.keepAlive ?? true,
            });
            this.storeCookies(response.headers.getSetCookie());
            if (!response.ok)
                throw new HttpError({ message: response.statusText, status: response.status, code: "UNKNOWN" });

            const isJson = response.headers.get("Content-Type")?.includes("application/json");
            return (isJson ? await response.json() : await response.text()) as TResult;
        } catch (error: unknown) {
            if (error instanceof HttpError) throw error;
            if (error instanceof Error) throw new HttpError({ message: error.message });
            throw new InternalServerError();
        }
    }

    private resolvePathPrefix(path: string): string {
        return path.startsWith("/") ? path : `/${path}`;
    }
}
