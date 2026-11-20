import type { CommandBus } from "@/packages/application/command-bus";
import type { HttpController } from "@/packages/infrastructure/http/http-controller";
import type { HttpResponse, HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { FooCommand } from "@/packages/building-blocks/__mocks__/foo.command";

export class FooHttpController implements HttpController {
    static readonly PATH = "/foo";

    constructor(
        httpServer: HttpServer,
        private readonly commandBus: CommandBus,
    ) {
        httpServer.post(FooHttpController.PATH, () => this.handle());
    }

    async handle(): Promise<HttpResponse> {
        await this.commandBus.dispatch(new FooCommand());
        return { status: HttpStatus.OK };
    }
}
