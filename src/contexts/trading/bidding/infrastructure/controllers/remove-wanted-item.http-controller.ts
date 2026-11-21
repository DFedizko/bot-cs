import type { CommandBus } from "@/packages/application/command-bus";
import type { HttpController } from "@/packages/infrastructure/http/http-controller";
import type { HttpRequest, HttpResponse, HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { RemoveWantedItemCommand } from "../../application/remove-wanted-item/remove-wanted-item.command";
import { WantedItemHttpInput } from "./wanted-item.http-input";

export class RemoveWantedItemHttpController implements HttpController {
    static readonly PATH = "/accounts/:accountId/wanted-items/:name";

    constructor(
        httpServer: HttpServer,
        private readonly commandBus: CommandBus,
    ) {
        httpServer.delete(RemoveWantedItemHttpController.PATH, (request) => this.handle(request));
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const input = new WantedItemHttpInput(request);
        await this.commandBus.dispatch(
            new RemoveWantedItemCommand({ accountId: input.readAccountId(), itemName: input.readPathItemName() }),
        );
        return { status: HttpStatus.OK };
    }
}
