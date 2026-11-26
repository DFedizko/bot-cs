import { addWantedItemDoc } from "@/contexts/trading/bidding/infrastructure/docs/add-wanted-item.route-doc";
import {
    BLANK_NAME,
    INVALID_MAX_PERCENTAGE,
    INVALID_WEAR,
    NAME_TOO_LONG,
    NON_POSITIVE_MAX_VALUE,
} from "@/contexts/trading/bidding/infrastructure/docs/wanted-item.error-examples";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";

const unprocessableExamples = () =>
    Object.values(
        addWantedItemDoc.responses.find(({ status }) => status === HttpStatus.UNPROCESSABLE_ENTITY)?.examples ?? {},
    );

describe("addWantedItemDoc", () => {
    it.each([
        ["a blank item name", BLANK_NAME],
        ["an item name too long", NAME_TOO_LONG],
        ["an invalid wear", INVALID_WEAR],
        ["an invalid max percentage", INVALID_MAX_PERCENTAGE],
        ["a max value not above zero", NON_POSITIVE_MAX_VALUE],
    ])("Should document the domain error of %s", (_name, example) => {
        const examples = unprocessableExamples();

        expect(examples).toContainEqual(example);
    });
});
