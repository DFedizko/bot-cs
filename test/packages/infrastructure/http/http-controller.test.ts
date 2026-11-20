import type { HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { CommandBusInMemory } from "@/packages/infrastructure/command-bus/command-bus.in-memory";
import { FooCommand } from "@/packages/building-blocks/__mocks__/foo.command";
import { EmptyStringError } from "@/packages/error/empty-string.error";
import { freePort } from "@/packages/external/http/__builders__/free-port.builder";
import { HTTP_SERVERS } from "@/packages/external/http/__builders__/http-servers.builder";
import { FooHttpController } from "./__stubs__/foo.http-controller";

let httpServer: HttpServer;

const postFoo = async (server: HttpServer) => {
    const port = freePort();
    server.listen(port);
    const response = await fetch(`http://localhost:${port}${FooHttpController.PATH}`, { method: "POST" });
    return { status: response.status, body: await response.text() };
};

describe.each(HTTP_SERVERS)("HttpController on the %s server", (_name, createServer) => {
    afterEach(async () => {
        await httpServer.close();
    });

    it("Should dispatch the command of its route", async () => {
        httpServer = createServer();
        const commandBus = new CommandBusInMemory();
        const handle = jest.fn(async () => {});
        commandBus.register({ subscribedTo: () => FooCommand.COMMAND_NAME, handle });
        new FooHttpController(httpServer, commandBus);

        await postFoo(httpServer);

        expect(handle).toHaveBeenCalledWith(expect.any(FooCommand));
    });

    it("Should answer ok with no body", async () => {
        httpServer = createServer();
        const commandBus = new CommandBusInMemory();
        commandBus.register({ subscribedTo: () => FooCommand.COMMAND_NAME, handle: async () => {} });
        new FooHttpController(httpServer, commandBus);

        const response = await postFoo(httpServer);

        expect(response).toEqual({ status: HttpStatus.OK, body: "" });
    });

    it("Should answer a domain error of its command with unprocessable entity", async () => {
        httpServer = createServer();
        const commandBus = new CommandBusInMemory();
        commandBus.register({
            subscribedTo: () => FooCommand.COMMAND_NAME,
            handle: async () => {
                throw new EmptyStringError();
            },
        });
        new FooHttpController(httpServer, commandBus);

        const response = await postFoo(httpServer);

        expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
});
