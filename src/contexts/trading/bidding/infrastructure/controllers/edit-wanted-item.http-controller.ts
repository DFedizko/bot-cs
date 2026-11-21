import type { CommandBus } from "@/packages/application/command-bus";
import type { HttpController } from "@/packages/infrastructure/http/http-controller";
import type { HttpRequest, HttpResponse, HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpRequestInput } from "@/packages/infrastructure/http/http-request-input";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { EditWantedItemCommand } from "../../application/edit-wanted-item/edit-wanted-item.command";
import type { EditWantedItemInput } from "./edit-wanted-item.input";

export class EditWantedItemHttpController implements HttpController {
    static readonly PATH = "/accounts/:accountId/wanted-items/:name";

    constructor(
        httpServer: HttpServer,
        private readonly commandBus: CommandBus,
        private readonly validator: Validator<EditWantedItemInput>,
        doc: HttpRouteDoc,
    ) {
        httpServer.patch(EditWantedItemHttpController.PATH, (request) => this.handle(request), {
            input: validator,
            doc,
        });
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const { name, ...input } = this.validator.validate(HttpRequestInput.from(request));
        await this.commandBus.dispatch(new EditWantedItemCommand({ ...input, itemName: name }));
        return { status: HttpStatus.OK };
    }
}
