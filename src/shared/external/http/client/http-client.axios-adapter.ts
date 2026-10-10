import axios, { AxiosError, type AxiosInstance } from "axios";
import { HttpClient, type HttpOptions } from "../../../infrastructure/http/http-client";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import { HttpError } from "../../../infrastructure/http/errors/http.error";
import { InternalServerError } from "../../../infrastructure/http/errors/internal-server.error";
import http from "node:http";
import type { HttpHeaders } from "@/shared/infrastructure/http/http-headers";

export class HttpClientAxiosAdapter extends HttpClient {
    private readonly http: AxiosInstance;
    constructor(
        private readonly baseUrl: string,
        options?: { keepAlive?: boolean },
    ) {
        super();
        this.http = axios.create({ httpAgent: new http.Agent({ keepAlive: options?.keepAlive ?? true }) });
    }

    async get<TResult, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: HttpOptions<undefined, THeaders>,
    ): Promise<TResult> {
        return await this.request(HttpMethod.GET, path, options);
    }

    async post<TResult, TBody = unknown, THeaders extends HttpHeaders = HttpHeaders>(
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
            const response = await this.http.request<TResult>({
                method,
                url: `${this.baseUrl}${path}`,
                data: options?.body,
                headers: { ...options?.headers, ...(cookie && { cookie }) },
            });
            this.storeCookies(response.headers["set-cookie"] ?? []);
            return response.data;
        } catch (error: unknown) {
            if (error instanceof AxiosError)
                throw new HttpError({ message: error.message, status: error.status, code: error.code });
            if (error instanceof HttpError) throw error;
            if (error instanceof Error) throw new HttpError({ message: error.message });
            throw new InternalServerError();
        }
    }
}
