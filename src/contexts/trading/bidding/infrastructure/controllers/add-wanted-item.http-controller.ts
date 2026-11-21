import type { CommandBus } from "@/packages/application/command-bus";
import type { HttpController } from "@/packages/infrastructure/http/http-controller";
import type { HttpRequest, HttpResponse, HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { AddWantedItemCommand } from "../../application/add-wanted-item/add-wanted-item.command";
import { WantedItemHttpInput } from "./wanted-item.http-input";

export class AddWantedItemHttpController implements HttpController {
    static readonly PATH = "/accounts/:accountId/wanted-items";

    constructor(
        httpServer: HttpServer,
        private readonly commandBus: CommandBus,
    ) {
        httpServer.post(AddWantedItemHttpController.PATH, (request) => this.handle(request));
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const input = new WantedItemHttpInput(request);
        await this.commandBus.dispatch(
            new AddWantedItemCommand({
                accountId: input.readAccountId(),
                itemName: input.readBodyItemName(),
                maxFor: input.readMaxFor(),
                criteria: input.readCriteria(),
            }),
        );
        return { status: HttpStatus.OK };
    }
}
