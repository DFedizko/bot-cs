import axios, { AxiosError } from "axios";
import { HttpClient, HttpHeaders, HttpOptions } from "./http-client";
import { HttpMethod } from "./http-method";
import { HttpError } from "./errors/http-error";
import { InternalServerError } from "./errors/internal-server.error";

export class HttpClientAxiosAdapter implements HttpClient {
    constructor(private readonly baseUrl: string) {}

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

    private async request<TResult, TBody = unknown, THeaders extends HttpHeaders = HttpHeaders>(
        method: HttpMethod,
        path: string,
        options?: HttpOptions<TBody, THeaders>,
    ): Promise<TResult> {
        try {
            const response = await axios.request<TResult>({
                method,
                url: `${this.baseUrl}${this.resolvePathPrefix(path)}`,
                data: options?.body,
                headers: options?.headers,
            });
            return response.data;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                throw new HttpError({ message: error.message, httpStatus: error.status, code: error.code });
            }
            if (error instanceof Error) {
                throw new HttpError({ message: error.message });
            }
            throw new InternalServerError();
        }
    }

    private resolvePathPrefix(path: string): string {
        return path.startsWith("/") ? path : `/${path}`;
    }
}
