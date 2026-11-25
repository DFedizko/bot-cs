// Source: https://github.com/ByMykel/CSGO-API (public/api/en/skins_not_grouped.json), checked 2026-11-24.
import type { ByMykelSkinsHttp } from "@/contexts/catalog/infrastructure/http/bymykel/bymykel-skins.http";
import type { GetSkinsNotGrouped } from "@/contexts/catalog/infrastructure/http/bymykel/get-skins-not-grouped";
import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";
import { skinsNotFound, skinsNotGrouped } from "./__mocks__/skins-not-grouped.mock";

export class ByMykelSkinsHttpFakeAdapter implements ByMykelSkinsHttp {
    constructor(
        private readonly skins: readonly unknown[] = skinsNotGrouped(),
        private readonly published = true,
    ) {}

    static unpublished(): ByMykelSkinsHttpFakeAdapter {
        return new ByMykelSkinsHttpFakeAdapter([], false);
    }

    async getSkinsNotGrouped(): Promise<GetSkinsNotGrouped.Response> {
        if (!this.published) throw new NotFoundError(skinsNotFound);
        return structuredClone(this.skins) as GetSkinsNotGrouped.Response;
    }
}
