import type { CommandBus } from "@/packages/application/command-bus";
import type { HttpController } from "@/packages/infrastructure/http/http-controller";
import type { HttpRequest, HttpResponse, HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { FooCommand } from "@/packages/building-blocks/__mocks__/foo.command";

export class FooHttpController implements HttpController {
    static readonly PATH = "/foo";

    constructor(
        httpServer: HttpServer,
        private readonly commandBus: CommandBus,
    ) {
        httpServer.post(FooHttpController.PATH, (request) => this.handle(request));
    }

    async handle(_request: HttpRequest): Promise<HttpResponse> {
        await this.commandBus.dispatch(new FooCommand());
        return { status: HttpStatus.OK };
    }
}
