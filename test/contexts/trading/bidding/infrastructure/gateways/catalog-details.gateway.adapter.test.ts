import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { Rarity } from "@/contexts/shared-kernel/domain/rarity";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { CATALOG_LOOKUP } from "@/contexts/catalog/external/di/catalog.identifiers";
import { CATALOG_DETAILS_GATEWAY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { CatalogDetailsGatewayAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/catalog-details.gateway.adapter";
import { CatalogLookupFakeAdapter } from "./catalog-lookup.fake-adapter";
import {
    ASIIMOV,
    ASIIMOV_IMAGE,
    asiimovItem,
    KARAMBIT,
    KARAMBIT_IMAGE,
    vanillaKarambitItem,
} from "./__mocks__/catalog-item.mock";

const UNKNOWN = "Not A Real Item";
const STATTRAK_SOUVENIR = { stattrak: true, souvenir: true };

const catalogKnows = (container: Container, ...items: ReturnType<typeof asiimovItem>[]) =>
    container.rebind(CATALOG_LOOKUP).toConstantValue(new CatalogLookupFakeAdapter(items));

let container: Container;

describe("CatalogDetailsGatewayAdapter", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should give the catalog details of the items the catalog knows, by market name", async () => {
        catalogKnows(container, asiimovItem());

        const details = await container.get(CATALOG_DETAILS_GATEWAY).findByNames([ASIIMOV]);

        expect(details).toEqual(
            new Map([
                [
                    ASIIMOV,
                    {
                        imageUrl: ASIIMOV_IMAGE,
                        rarity: Rarity.COVERT,
                        weapon: "AWP",
                        skin: "Asiimov",
                        wear: WearName.FIELD_TESTED,
                        stattrak: false,
                        souvenir: false,
                    },
                ],
            ]),
        );
    });

    it("Should keep the StatTrak and Souvenir flags of the item", async () => {
        catalogKnows(container, asiimovItem(STATTRAK_SOUVENIR));

        const details = await container.get(CATALOG_DETAILS_GATEWAY).findByNames([ASIIMOV]);

        expect(details.get(ASIIMOV)).toMatchObject(STATTRAK_SOUVENIR);
    });

    it("Should give no details for the names the catalog doesn't know", async () => {
        catalogKnows(container, asiimovItem());

        const details = await container.get(CATALOG_DETAILS_GATEWAY).findByNames([UNKNOWN, ASIIMOV]);

        expect([...details.keys()]).toEqual([ASIIMOV]);
    });

    it("Should call a vanilla item's skin Vanilla, with no wear", async () => {
        catalogKnows(container, vanillaKarambitItem());

        const details = await container.get(CATALOG_DETAILS_GATEWAY).findByNames([KARAMBIT]);

        expect(details.get(KARAMBIT)).toMatchObject({
            weapon: "Karambit",
            skin: CatalogDetailsGatewayAdapter.VANILLA_SKIN,
            wear: null,
            imageUrl: KARAMBIT_IMAGE,
        });
    });

    it("Should look up every name in one call to the catalog", async () => {
        catalogKnows(container);
        const lookupSpy = jest.spyOn(container.get(CATALOG_LOOKUP), "findByNames");

        await container.get(CATALOG_DETAILS_GATEWAY).findByNames([ASIIMOV, KARAMBIT]);

        expect(lookupSpy.mock.calls).toEqual([[[ASIIMOV, KARAMBIT]]]);
    });
});
