import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import {
    COMMAND_BUS,
    HTTP_CONTROLLER,
    HTTP_ERROR_MAPPING,
    HTTP_ROUTE_DOC,
    HTTP_SERVER,
} from "@/packages/external/di/packages.identifiers";
import { ValidatorZodAdapter } from "@/packages/external/validation/validator.zod-adapter";
import type { CommandBus } from "@/packages/application/command-bus";
import type { HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import { AddWantedItemHttpController } from "../../infrastructure/controllers/add-wanted-item.http-controller";
import { EditWantedItemHttpController } from "../../infrastructure/controllers/edit-wanted-item.http-controller";
import { RemoveWantedItemHttpController } from "../../infrastructure/controllers/remove-wanted-item.http-controller";
import { ToggleWantedItemHttpController } from "../../infrastructure/controllers/toggle-wanted-item.http-controller";
import type { AddWantedItemInput } from "../../infrastructure/controllers/add-wanted-item.input";
import type { EditWantedItemInput } from "../../infrastructure/controllers/edit-wanted-item.input";
import type { RemoveWantedItemInput } from "../../infrastructure/controllers/remove-wanted-item.input";
import type { ToggleWantedItemInput } from "../../infrastructure/controllers/toggle-wanted-item.input";
import { WantedItemNotFoundError } from "../../domain/wanted-item/errors/wanted-item-not-found.error";
import { WantedItemAlreadyExistsError } from "../../domain/wanted-item/errors/wanted-item-already-exists.error";
import { addWantedItemSchema } from "../validation/add-wanted-item.schema";
import { editWantedItemSchema } from "../validation/edit-wanted-item.schema";
import { removeWantedItemSchema } from "../validation/remove-wanted-item.schema";
import { toggleWantedItemSchema } from "../validation/toggle-wanted-item.schema";
import { addWantedItemRoute } from "../docs/add-wanted-item.route-doc";
import { editWantedItemRoute } from "../docs/edit-wanted-item.route-doc";
import { removeWantedItemRoute } from "../docs/remove-wanted-item.route-doc";
import { toggleWantedItemRoute } from "../docs/toggle-wanted-item.route-doc";
import {
    ADD_WANTED_ITEM_CONTROLLER,
    ADD_WANTED_ITEM_VALIDATOR,
    EDIT_WANTED_ITEM_CONTROLLER,
    EDIT_WANTED_ITEM_VALIDATOR,
    REMOVE_WANTED_ITEM_CONTROLLER,
    REMOVE_WANTED_ITEM_VALIDATOR,
    TOGGLE_WANTED_ITEM_CONTROLLER,
    TOGGLE_WANTED_ITEM_VALIDATOR,
} from "./bidding.identifiers";

export class BiddingHttpModule extends ContainerModule {
    private static readonly HTTP_CONTROLLERS = [
        ADD_WANTED_ITEM_CONTROLLER,
        EDIT_WANTED_ITEM_CONTROLLER,
        REMOVE_WANTED_ITEM_CONTROLLER,
        TOGGLE_WANTED_ITEM_CONTROLLER,
    ];
    private static readonly ROUTE_DOCS = [
        addWantedItemRoute,
        editWantedItemRoute,
        removeWantedItemRoute,
        toggleWantedItemRoute,
    ];

    constructor() {
        super((options) => BiddingHttpModule.bindAll(options));
    }

    private static bindAll(options: ContainerModuleLoadOptions): void {
        BiddingHttpModule.bindValidators(options);
        BiddingHttpModule.bindControllers(options);
        BiddingHttpModule.bindErrorMappings(options);
        BiddingHttpModule.ROUTE_DOCS.forEach((route) => options.bind(HTTP_ROUTE_DOC).toConstantValue(route));
    }

    private static bindValidators({ bind }: ContainerModuleLoadOptions): void {
        bind(ADD_WANTED_ITEM_VALIDATOR)
            .toResolvedValue(() => new ValidatorZodAdapter(addWantedItemSchema))
            .inSingletonScope();
        bind(EDIT_WANTED_ITEM_VALIDATOR)
            .toResolvedValue(() => new ValidatorZodAdapter(editWantedItemSchema))
            .inSingletonScope();
        bind(REMOVE_WANTED_ITEM_VALIDATOR)
            .toResolvedValue(() => new ValidatorZodAdapter(removeWantedItemSchema))
            .inSingletonScope();
        bind(TOGGLE_WANTED_ITEM_VALIDATOR)
            .toResolvedValue(() => new ValidatorZodAdapter(toggleWantedItemSchema))
            .inSingletonScope();
    }

    private static bindControllers({ bind }: ContainerModuleLoadOptions): void {
        bind(ADD_WANTED_ITEM_CONTROLLER)
            .toResolvedValue(
                (http: HttpServer, bus: CommandBus, validator: Validator<AddWantedItemInput>) =>
                    new AddWantedItemHttpController(http, bus, validator),
                [HTTP_SERVER, COMMAND_BUS, ADD_WANTED_ITEM_VALIDATOR],
            )
            .inSingletonScope();
        bind(EDIT_WANTED_ITEM_CONTROLLER)
            .toResolvedValue(
                (http: HttpServer, bus: CommandBus, validator: Validator<EditWantedItemInput>) =>
                    new EditWantedItemHttpController(http, bus, validator),
                [HTTP_SERVER, COMMAND_BUS, EDIT_WANTED_ITEM_VALIDATOR],
            )
            .inSingletonScope();
        bind(REMOVE_WANTED_ITEM_CONTROLLER)
            .toResolvedValue(
                (http: HttpServer, bus: CommandBus, validator: Validator<RemoveWantedItemInput>) =>
                    new RemoveWantedItemHttpController(http, bus, validator),
                [HTTP_SERVER, COMMAND_BUS, REMOVE_WANTED_ITEM_VALIDATOR],
            )
            .inSingletonScope();
        bind(TOGGLE_WANTED_ITEM_CONTROLLER)
            .toResolvedValue(
                (http: HttpServer, bus: CommandBus, validator: Validator<ToggleWantedItemInput>) =>
                    new ToggleWantedItemHttpController(http, bus, validator),
                [HTTP_SERVER, COMMAND_BUS, TOGGLE_WANTED_ITEM_VALIDATOR],
            )
            .inSingletonScope();
        BiddingHttpModule.HTTP_CONTROLLERS.forEach((controller) => bind(HTTP_CONTROLLER).toService(controller));
    }

    private static bindErrorMappings({ bind }: ContainerModuleLoadOptions): void {
        bind(HTTP_ERROR_MAPPING).toConstantValue({ error: WantedItemNotFoundError, status: HttpStatus.NOT_FOUND });
        bind(HTTP_ERROR_MAPPING).toConstantValue({ error: WantedItemAlreadyExistsError, status: HttpStatus.CONFLICT });
    }
}
