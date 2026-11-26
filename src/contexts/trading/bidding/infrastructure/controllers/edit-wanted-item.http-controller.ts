import type { CommandBus } from "@/packages/application/command-bus";
import type { HttpController } from "@/packages/infrastructure/http/http-controller";
import type { HttpRequest, HttpResponse, HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpRequestInput } from "@/packages/infrastructure/http/http-request-input";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { EditWantedItemCommand } from "../../application/edit-wanted-item/edit-wanted-item.command";
import type { CriteriaPrimitives } from "../../domain/wanted-item/criteria/criteria.factory";
import type { MaxForInput } from "../currency/max-for.input";
import type { UserCurrencyConverter } from "../currency/user-currency.converter";

export type EditWantedItemInput = {
    accountId: number;
    name: string;
    maxFor?: MaxForInput;
    criteria?: CriteriaPrimitives;
};

export class EditWantedItemHttpController implements HttpController {
    static readonly PATH = "/accounts/:accountId/wanted-items/:name";

    constructor(
        httpServer: HttpServer,
        private readonly commandBus: CommandBus,
        private readonly validator: Validator<EditWantedItemInput>,
        private readonly converter: UserCurrencyConverter,
        doc: HttpRouteDoc,
    ) {
        httpServer.patch(EditWantedItemHttpController.PATH, (request) => this.handle(request), {
            input: validator,
            doc,
        });
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const { name, maxFor, ...input } = this.validator.validate(HttpRequestInput.from(request));
        const maxForInCoins = maxFor && this.converter.readMaxFor(maxFor);
        await this.commandBus.dispatch(new EditWantedItemCommand({ ...input, maxFor: maxForInCoins, itemName: name }));
        return { status: HttpStatus.OK };
    }
}
