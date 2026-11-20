import type { CommandBus } from "@/packages/application/command-bus";
import type { HttpController } from "@/packages/infrastructure/http/http-controller";
import type { HttpRequest, HttpResponse, HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { EditWantedItemCommand } from "../../application/edit-wanted-item/edit-wanted-item.command";
import { WantedItemHttpInput } from "./wanted-item.http-input";

export class EditWantedItemHttpController implements HttpController {
    static readonly PATH = "/accounts/:accountId/wanted-items/:name";

    constructor(
        httpServer: HttpServer,
        private readonly commandBus: CommandBus,
    ) {
        httpServer.patch(EditWantedItemHttpController.PATH, (request) => this.handle(request));
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const input = new WantedItemHttpInput(request);
        await this.commandBus.dispatch(
            new EditWantedItemCommand({
                accountId: input.readAccountId(),
                itemName: input.readItemName(),
                maxFor: input.readOptionalMaxFor(),
                criteria: input.readCriteria(),
            }),
        );
        return { status: HttpStatus.OK };
    }
}
