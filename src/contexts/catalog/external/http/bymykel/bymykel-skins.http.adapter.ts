import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import type { ByMykelSkinsHttp } from "../../../infrastructure/http/bymykel/bymykel-skins.http";
import type { GetSkinsNotGrouped } from "../../../infrastructure/http/bymykel/get-skins-not-grouped";

export class ByMykelSkinsHttpAdapter implements ByMykelSkinsHttp {
    static readonly BASE_URL = "https://raw.githubusercontent.com";
    static readonly SKINS_PATH = "/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json";

    constructor(private readonly client: HttpClient) {}

    getSkinsNotGrouped(): Promise<GetSkinsNotGrouped.Response> {
        return this.client.get<GetSkinsNotGrouped.Response>(ByMykelSkinsHttpAdapter.SKINS_PATH);
    }
}
