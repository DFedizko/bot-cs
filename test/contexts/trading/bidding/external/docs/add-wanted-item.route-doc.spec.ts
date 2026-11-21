import { addWantedItemRoute } from "@/contexts/trading/bidding/external/docs/add-wanted-item.route-doc";
import {
    BLANK_NAME,
    INVALID_WEAR,
    NAME_OUT_OF_BOUNDS,
} from "@/contexts/trading/bidding/external/docs/wanted-item.error-examples";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";

const unprocessableExamples = () =>
    Object.values(
        addWantedItemRoute.responses.find(({ status }) => status === HttpStatus.UNPROCESSABLE_ENTITY)?.examples ?? {},
    );

describe("addWantedItemRoute", () => {
    it.each([
        ["a blank item name", BLANK_NAME],
        ["an item name out of bounds", NAME_OUT_OF_BOUNDS],
        ["an invalid wear", INVALID_WEAR],
    ])("Should document the domain error of %s", (_name, example) => {
        const examples = unprocessableExamples();

        expect(examples).toContainEqual(example);
    });
});
