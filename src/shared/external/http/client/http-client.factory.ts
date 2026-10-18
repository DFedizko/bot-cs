import type { HttpClient, HttpClientOptions } from "@/shared/infrastructure/http/http-client";

export interface HttpClientFactory {
    create(baseUrl: string, options?: HttpClientOptions): HttpClient;
}
