import type { GetSkinsNotGrouped } from "@/contexts/catalog/infrastructure/http/bymykel/get-skins-not-grouped";
import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";
import { ByMykelSkinsHttpFakeAdapter } from "./bymykel-skins.http.fake-adapter";
import { skinsNotFound, skinsNotGrouped } from "./__mocks__/skins-not-grouped.mock";

describe("ByMykelSkinsHttp", () => {
    it("Should give every skin, one per wear and StatTrak or Souvenir version", async () => {
        const response = await new ByMykelSkinsHttpFakeAdapter().getSkinsNotGrouped();

        expectTypeOf(response).toEqualTypeOf<GetSkinsNotGrouped.Response>();
        expect(response).toEqual(skinsNotGrouped());
    });

    it("Should give new objects on every call", async () => {
        const http = new ByMykelSkinsHttpFakeAdapter();
        const [first] = await http.getSkinsNotGrouped();
        Object.assign(first ?? {}, { market_hash_name: "changed" });

        const response = await http.getSkinsNotGrouped();

        expect(response).toEqual(skinsNotGrouped());
    });

    it("Should fail as not found when the file is not published", async () => {
        const request = ByMykelSkinsHttpFakeAdapter.unpublished().getSkinsNotGrouped();

        await expect(request).rejects.toThrow(new NotFoundError(skinsNotFound));
    });
});
