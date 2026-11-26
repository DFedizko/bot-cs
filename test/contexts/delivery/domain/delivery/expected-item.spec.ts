import { ExpectedItem } from "@/contexts/delivery/domain/delivery/expected-item";
import { MarketHashName } from "@/contexts/shared-kernel/domain/market-hash-name";
import { CS_APP_ID } from "@/contexts/shared-kernel/domain/cs-app-id";
import { DomainError } from "@/packages/error/domain-error";
import { EmptyStringError } from "@/packages/error/empty-string.error";

const ASSET_ID = "30123456789";
const MARKET_NAME = "AWP | Asiimov (Field-Tested)";
const TOO_LONG_NAME = "A".repeat(MarketHashName.MAX_LENGTH + 1);

const expectedItem = (marketName: string) => ExpectedItem.create({ assetId: ASSET_ID, marketName, appId: CS_APP_ID });

describe("ExpectedItem", () => {
    it("Should keep the trimmed market hash name of the item", () => {
        const item = expectedItem(` ${MARKET_NAME} `);

        expect(item.toPrimitives().marketName).toBe(MARKET_NAME);
    });

    it("Should reject a blank market hash name", () => {
        expect(() => expectedItem("  ")).toThrow(EmptyStringError);
    });

    it("Should reject a name longer than a market hash name can be", () => {
        expect(() => expectedItem(TOO_LONG_NAME)).toThrow(DomainError);
    });
});
