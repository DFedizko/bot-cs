import type { HttpClient, HttpClientOptions } from "@/packages/infrastructure/http/http-client";

export interface HttpClientFactory {
    create(baseUrl: string, options?: HttpClientOptions): HttpClient;
}
