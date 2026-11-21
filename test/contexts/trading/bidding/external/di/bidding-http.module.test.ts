import type { Container } from "inversify";
import { biddingContainer } from "./__builders__/bidding-container.builder";
import { fakeExternals } from "@/__builders__/externals.builder";
import {
    ADD_WANTED_ITEM_CONTROLLER,
    ADD_WANTED_ITEM_VALIDATOR,
    EDIT_WANTED_ITEM_CONTROLLER,
    EDIT_WANTED_ITEM_VALIDATOR,
    REMOVE_WANTED_ITEM_CONTROLLER,
    REMOVE_WANTED_ITEM_VALIDATOR,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { HTTP_ERROR_MAPPER } from "@/packages/external/di/packages.identifiers";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { ZodValidatorAdapter } from "@/packages/external/validation/validator.zod-adapter";
import { AddWantedItemHttpController } from "@/contexts/trading/bidding/infrastructure/controllers/add-wanted-item.http-controller";
import { EditWantedItemHttpController } from "@/contexts/trading/bidding/infrastructure/controllers/edit-wanted-item.http-controller";
import { RemoveWantedItemHttpController } from "@/contexts/trading/bidding/infrastructure/controllers/remove-wanted-item.http-controller";
import { WantedItemNotFoundError } from "@/contexts/trading/bidding/domain/wanted-item/errors/wanted-item-not-found.error";
import { WantedItemAlreadyExistsError } from "@/contexts/trading/bidding/domain/wanted-item/errors/wanted-item-already-exists.error";

const ENVIRONMENTS: ("development" | "production")[] = ["development", "production"];
const HTTP_CONTROLLERS = [
    { identifier: ADD_WANTED_ITEM_CONTROLLER, implementation: AddWantedItemHttpController },
    { identifier: EDIT_WANTED_ITEM_CONTROLLER, implementation: EditWantedItemHttpController },
    { identifier: REMOVE_WANTED_ITEM_CONTROLLER, implementation: RemoveWantedItemHttpController },
];
const VALIDATORS = [
    { identifier: ADD_WANTED_ITEM_VALIDATOR, name: "add" },
    { identifier: EDIT_WANTED_ITEM_VALIDATOR, name: "edit" },
    { identifier: REMOVE_WANTED_ITEM_VALIDATOR, name: "remove" },
];
const ACCOUNT_ID = 1;
const ITEM_NAME = "AWP | Asiimov (Field-Tested)";
const HTTP_ERROR_STATUSES = [
    { error: new WantedItemNotFoundError(ACCOUNT_ID, ITEM_NAME), status: HttpStatus.NOT_FOUND },
    { error: new WantedItemAlreadyExistsError(ACCOUNT_ID, ITEM_NAME), status: HttpStatus.CONFLICT },
];

let container: Container;

describe.each(ENVIRONMENTS)("BiddingHttpModule in %s", (nodeEnv) => {
    beforeEach(() => {
        container = biddingContainer(nodeEnv);
    });

    it.each(HTTP_CONTROLLERS)("Should bind the $implementation.name", async ({ identifier, implementation }) => {
        const controller = await fakeExternals(container).getAsync(identifier);

        expect(controller).toBeInstanceOf(implementation);
    });

    it.each(VALIDATORS)("Should bind the zod validator of the $name wanted item input", ({ identifier }) => {
        const validator = container.get(identifier);

        expect(validator).toBeInstanceOf(ZodValidatorAdapter);
    });

    it("Should convert the input with the endpoint's schema", () => {
        const validator = container.get(ADD_WANTED_ITEM_VALIDATOR);

        const input = validator.validate({ accountId: "1", name: ITEM_NAME, maxFor: -3 });

        expect(input).toEqual({ accountId: ACCOUNT_ID, name: ITEM_NAME, maxFor: "-3" });
    });

    it.each(HTTP_ERROR_STATUSES)("Should answer $error.name with $status", ({ error, status }) => {
        const errorMapper = container.get(HTTP_ERROR_MAPPER);

        const response = errorMapper.map(error);

        expect(response.status).toBe(status);
    });
});
