import axios from "axios";
import type { AxiosInstance } from "axios";
import { HttpClient } from "@/shared/lib/http/http-client";
import type { HttpClientOptions, HttpHeaders, HttpOptions, HttpReadOptions } from "@/shared/lib/http/http-client";
import { HTTP_METHOD } from "@/shared/lib/http/http-method";
import type { HttpMethod } from "@/shared/lib/http/http-method";
import { mapAxiosError } from "./map-axios-error";

const FETCH_ADAPTER = "fetch";

export class HttpClientAxiosAdapter extends HttpClient {
    private readonly http: AxiosInstance;

    constructor(baseUrl: string, options?: HttpClientOptions) {
        super();
        this.http = axios.create({ adapter: FETCH_ADAPTER, baseURL: baseUrl, headers: options?.defaultHeaders });
    }

    get<TResult, THeaders extends HttpHeaders = HttpHeaders>(path: string, options?: HttpReadOptions<THeaders>) {
        return this.request<TResult>(HTTP_METHOD.GET, path, options);
    }

    post<TResult, TBody = unknown, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: HttpOptions<TBody, THeaders>,
    ) {
        return this.request<TResult>(HTTP_METHOD.POST, path, options);
    }

    put<TResult, TBody = unknown, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: HttpOptions<TBody, THeaders>,
    ) {
        return this.request<TResult>(HTTP_METHOD.PUT, path, options);
    }

    patch<TResult, TBody = unknown, THeaders extends HttpHeaders = HttpHeaders>(
        path: string,
        options?: HttpOptions<TBody, THeaders>,
    ) {
        return this.request<TResult>(HTTP_METHOD.PATCH, path, options);
    }

    delete<TResult, THeaders extends HttpHeaders = HttpHeaders>(path: string, options?: HttpReadOptions<THeaders>) {
        return this.request<TResult>(HTTP_METHOD.DELETE, path, options);
    }

    private async request<TResult>(method: HttpMethod, url: string, options?: HttpOptions): Promise<TResult> {
        try {
            const response = await this.http.request<TResult>({
                method,
                url,
                data: options?.body,
                headers: options?.headers,
                params: options?.query,
            });
            return response.data;
        } catch (error: unknown) {
            throw mapAxiosError(error);
        }
    }
}
