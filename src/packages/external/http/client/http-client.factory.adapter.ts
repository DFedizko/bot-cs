import { HttpClientFetchAdapter } from "./http-client.fetch-adapter";
import { HttpClientAxiosAdapter } from "./http-client.axios-adapter";
import type { HttpClientFactory } from "./http-client.factory";
import type { HttpClient, HttpClientOptions } from "@/packages/infrastructure/http/http-client";

const httpClients = {
    fetch: (baseUrl: string, options?: HttpClientOptions) => new HttpClientFetchAdapter(baseUrl, options),
    axios: (baseUrl: string, options?: HttpClientOptions) => new HttpClientAxiosAdapter(baseUrl, options),
} as const;

export type HttpClientProvider = keyof typeof httpClients;

export class HttpClientFactoryAdapter implements HttpClientFactory {
    constructor(private readonly provider: HttpClientProvider) {}

    create(baseUrl: string, options?: HttpClientOptions): HttpClient {
        return httpClients[this.provider](baseUrl, options);
    }
}
