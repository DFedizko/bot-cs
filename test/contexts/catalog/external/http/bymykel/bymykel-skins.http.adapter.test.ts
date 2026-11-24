import type { Container } from "inversify";
import { BYMYKEL_HTTP_CLIENT, BYMYKEL_SKINS_HTTP } from "@/contexts/catalog/external/di/catalog.identifiers";
import { catalogContainer } from "../../di/__builders__/catalog-container.builder";
import { skinsNotGrouped } from "./__mocks__/skins-not-grouped.mock";

const SKINS_PATH = "/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json";

let container: Container;

describe("ByMykelSkinsHttpAdapter", () => {
    beforeEach(() => {
        container = catalogContainer();
    });

    it("Should get the skins from the published path", async () => {
        const getSpy = jest.spyOn(container.get(BYMYKEL_HTTP_CLIENT), "get").mockResolvedValue(skinsNotGrouped());

        await container.get(BYMYKEL_SKINS_HTTP).getSkinsNotGrouped();

        expect(getSpy).toHaveBeenCalledWith(SKINS_PATH);
    });

    it("Should give the skins the client reads", async () => {
        jest.spyOn(container.get(BYMYKEL_HTTP_CLIENT), "get").mockResolvedValue(skinsNotGrouped());

        const skins = await container.get(BYMYKEL_SKINS_HTTP).getSkinsNotGrouped();

        expect(skins).toEqual(skinsNotGrouped());
    });
});
