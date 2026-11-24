import type { CommandBus } from "@/packages/application/command-bus";
import type { HttpController } from "@/packages/infrastructure/http/http-controller";
import type { HttpRequest, HttpResponse, HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpRequestInput } from "@/packages/infrastructure/http/http-request-input";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { AddWantedItemCommand } from "../../application/add-wanted-item/add-wanted-item.command";
import type { CriteriaPrimitives } from "../../domain/wanted-item/criteria/criteria.factory";
import type { MaxForPrimitives } from "../../domain/wanted-item/max-for/max-for";

export type AddWantedItemInput = {
    accountId: number;
    name: string;
    maxFor: MaxForPrimitives;
    criteria?: CriteriaPrimitives;
};

export class AddWantedItemHttpController implements HttpController {
    static readonly PATH = "/accounts/:accountId/wanted-items";

    constructor(
        httpServer: HttpServer,
        private readonly commandBus: CommandBus,
        private readonly validator: Validator<AddWantedItemInput>,
        doc: HttpRouteDoc,
    ) {
        httpServer.post(AddWantedItemHttpController.PATH, (request) => this.handle(request), { input: validator, doc });
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const { name, ...input } = this.validator.validate(HttpRequestInput.from(request));
        await this.commandBus.dispatch(new AddWantedItemCommand({ ...input, itemName: name }));
        return { status: HttpStatus.OK };
    }
}
