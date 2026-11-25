import type { GetSkinsNotGrouped } from "./get-skins-not-grouped";

export interface ByMykelSkinsHttp {
    getSkinsNotGrouped(): Promise<GetSkinsNotGrouped.Response>;
}
