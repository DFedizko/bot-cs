import type { HttpClientFactory } from "@/shared/external/http/client/http-client.factory";
import type { HttpClient } from "@/shared/infrastructure/http/http-client";

const CSGOEMPIRE_BASE_URL = "https://csgoempire.com/api/v2";

export class CsgoempireHttpClientFactory {
    static create(httpClientFactory: HttpClientFactory, apiKey: string): HttpClient {
        return httpClientFactory.create(CSGOEMPIRE_BASE_URL, { defaultHeaders: { Authorization: `Bearer ${apiKey}` } });
    }
}
