import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { Rarity } from "@/contexts/catalog/domain/catalog-item/rarity";
import type { CatalogItem } from "@/contexts/catalog/domain/catalog-item/catalog-item";
import { BYMYKEL_SKINS_HTTP, CATALOG_SOURCE } from "@/contexts/catalog/external/di/catalog.identifiers";
import { ByMykelSkinsHttpFakeAdapter } from "../../external/http/bymykel/bymykel-skins.http.fake-adapter";
import { awpAsiimovFieldTested, byMykelSkin } from "../../external/http/bymykel/__mocks__/bymykel-skin.mock";
import {
    akCraneFlight,
    akFirstClass,
    akOlivePolycam,
    akUncharted,
    handWrapsSpruceDdpat,
    m4a4Howl,
    skinsNotGrouped,
    souvenirAugSurveillance,
    stattrakAwpAsiimov,
    vanillaKarambit,
} from "../../external/http/bymykel/__mocks__/skins-not-grouped.mock";

const WITHOUT_MARKET_NAME = { ...byMykelSkin(), market_hash_name: undefined };
const UNKNOWN_RARITY = byMykelSkin({ rarity: { id: "rarity_unknown", name: "Unknown", color: "#000" } } as never);
const BROKEN_ENTRIES = [WITHOUT_MARKET_NAME, UNKNOWN_RARITY, null];

const sourceServes = (container: Container, skins: readonly unknown[]) =>
    container.rebind(BYMYKEL_SKINS_HTTP).toConstantValue(new ByMykelSkinsHttpFakeAdapter(skins));

const loadedItem = async (container: Container, marketHashName: string) => {
    const items = await container.get(CATALOG_SOURCE).load();
    return items.find((item: CatalogItem) => item.marketHashName === marketHashName)?.toPrimitives();
};

let container: Container;

describe("CatalogSourceByMykelAdapter", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should give one catalog item per skin the source lists", async () => {
        const items = await container.get(CATALOG_SOURCE).load();

        expect(items).toHaveLength(skinsNotGrouped().length);
    });

    it("Should map a skin to a catalog item", async () => {
        const item = await loadedItem(container, awpAsiimovFieldTested.market_hash_name);

        expect(item).toEqual({
            marketHashName: "AWP | Asiimov (Field-Tested)",
            weapon: "AWP",
            skin: "Asiimov",
            wear: WearName.FIELD_TESTED,
            stattrak: false,
            souvenir: false,
            category: "Rifles",
            rarity: Rarity.COVERT,
            imageUrl: awpAsiimovFieldTested.image,
        });
    });

    it.each([
        [souvenirAugSurveillance, Rarity.CONSUMER],
        [akOlivePolycam, Rarity.INDUSTRIAL],
        [akUncharted, Rarity.MILSPEC],
        [akFirstClass, Rarity.RESTRICTED],
        [akCraneFlight, Rarity.CLASSIFIED],
        [awpAsiimovFieldTested, Rarity.COVERT],
        [handWrapsSpruceDdpat, Rarity.EXTRAORDINARY],
        [m4a4Howl, Rarity.CONTRABAND],
    ])("Should map the rarity of $rarity.name to our own", async (skin, rarity) => {
        const item = await loadedItem(container, skin.market_hash_name);

        expect(item?.rarity).toBe(rarity);
    });

    it("Should map a skin without pattern or wear, such as a vanilla knife, to nulls", async () => {
        const item = await loadedItem(container, vanillaKarambit.market_hash_name);

        expect(item).toMatchObject({ weapon: "Karambit", skin: null, wear: null, souvenir: false, category: "Knives" });
    });

    it("Should map a StatTrak skin", async () => {
        const item = await loadedItem(container, stattrakAwpAsiimov.market_hash_name);

        expect(item).toMatchObject({ stattrak: true, souvenir: false });
    });

    it("Should map a Souvenir skin", async () => {
        const item = await loadedItem(container, souvenirAugSurveillance.market_hash_name);

        expect(item).toMatchObject({ stattrak: false, souvenir: true });
    });

    it("Should skip the entries the contract rejects", async () => {
        sourceServes(container, [...BROKEN_ENTRIES, ...skinsNotGrouped()]);

        const items = await container.get(CATALOG_SOURCE).load();

        expect(items).toHaveLength(skinsNotGrouped().length);
    });

    it("Should count the rejected entries in one warning", async () => {
        sourceServes(container, [...BROKEN_ENTRIES, ...skinsNotGrouped()]);
        const logSpy = jest.spyOn(container.get(LOGGER), "log");

        await container.get(CATALOG_SOURCE).load();

        expect(logSpy.mock.calls).toEqual([["Warning: the catalog source has 3 entries the contract rejects"]]);
    });

    it("Should warn about nothing when every entry is valid", async () => {
        const logSpy = jest.spyOn(container.get(LOGGER), "log");

        await container.get(CATALOG_SOURCE).load();

        expect(logSpy).not.toHaveBeenCalled();
    });

    it("Should fail as the source fails", async () => {
        container.rebind(BYMYKEL_SKINS_HTTP).toConstantValue(ByMykelSkinsHttpFakeAdapter.unpublished());

        const loading = container.get(CATALOG_SOURCE).load();

        await expect(loading).rejects.toThrow(NotFoundError);
    });
});
