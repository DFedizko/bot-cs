import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { CATALOG_DETAILS_GATEWAY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";

const ASIIMOV = "AWP | Asiimov (Field-Tested)";

let container: Container;

describe("CatalogDetailsGatewayEmptyAdapter", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should know no item until the catalog is plugged in", async () => {
        const details = await container.get(CATALOG_DETAILS_GATEWAY).findByNames([ASIIMOV]);

        expect(details.size).toBe(0);
    });
});
