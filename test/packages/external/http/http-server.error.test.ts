import type { HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";
import { HttpErrorMapperByErrorClass } from "@/packages/infrastructure/http/http-error.mapper.by-error-class";
import { EmptyStringError } from "@/packages/error/empty-string.error";
import { FooNotFoundError } from "@/packages/infrastructure/http/__stubs__/foo.errors";
import { freePort } from "./__builders__/free-port.builder";
import { HTTP_SERVERS } from "./__builders__/http-servers.builder";

const PATH = "/foo";

let httpServer: HttpServer;

const requestFoo = async (port: number) => {
    const response = await fetch(`http://localhost:${port}${PATH}`, { method: "POST" });
    return { status: response.status, body: await response.json() };
};

const listenOnFreePort = (server: HttpServer): number => {
    const port = freePort();
    server.listen(port);
    return port;
};

describe.each(HTTP_SERVERS)("Http Server %s Adapter errors", (_name, createServer) => {
    afterEach(async () => {
        await httpServer.close();
    });

    it("Should answer a thrown domain error with unprocessable entity and its code", async () => {
        httpServer = createServer();
        httpServer.post(PATH, async () => {
            throw new EmptyStringError();
        });
        const port = listenOnFreePort(httpServer);

        const response = await requestFoo(port);

        expect(response).toEqual({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            body: { code: "EMPTY_STRING", message: "The value provided must not be empty" },
        });
    });

    it("Should answer a thrown http error with its own status and code", async () => {
        httpServer = createServer();
        httpServer.post(PATH, () => {
            throw new NotFoundError("Foo not found");
        });
        const port = listenOnFreePort(httpServer);

        const response = await requestFoo(port);

        expect(response).toEqual({
            status: HttpStatus.NOT_FOUND,
            body: { code: "NOT_FOUND", message: "Foo not found" },
        });
    });

    it("Should answer an unknown error with internal server error and no internal message", async () => {
        httpServer = createServer();
        httpServer.post(PATH, async () => {
            throw new TypeError("Cannot read properties of undefined");
        });
        const port = listenOnFreePort(httpServer);

        const response = await requestFoo(port);

        expect(response).toEqual({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            body: { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" },
        });
    });

    it("Should answer with the mapping of the injected error mapper", async () => {
        httpServer = createServer(
            new HttpErrorMapperByErrorClass([{ error: FooNotFoundError, status: HttpStatus.NOT_FOUND }]),
        );
        httpServer.post(PATH, async () => {
            throw new FooNotFoundError();
        });
        const port = listenOnFreePort(httpServer);

        const response = await requestFoo(port);

        expect(response).toEqual({
            status: HttpStatus.NOT_FOUND,
            body: { code: "FOO_NOT_FOUND", message: "Foo not found" },
        });
    });
});
