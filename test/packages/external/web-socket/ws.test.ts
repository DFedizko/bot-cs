import type { WsClient } from "@/packages/infrastructure/web-socket/ws-client";
import { WsClientBunAdapter } from "@/packages/external/web-socket/client/ws-client.bun-adapter";
import { WsClientSocketIoAdapter } from "@/packages/external/web-socket/client/ws-client.socket-io-adapter";
import type { WsServer } from "@/packages/infrastructure/web-socket/ws-server";
import { WsServerBunAdapter } from "@/packages/external/web-socket/server/ws-server.bun-adapter";
import { WsServerSocketIoAdapter } from "@/packages/external/web-socket/server/ws-server.socket-io-adapter";
import { HttpServerBunAdapter } from "@/packages/external/http/server/http-server.bun-adapter";
import { HttpServerExpressAdapter } from "@/packages/external/http/server/http-server.express-adapter";
import type { HttpServer } from "@/packages/infrastructure/http/http-server";

type FooData = {
    name: string;
};
const FOO_MESSAGE = "foo_message";
const PORT = 8000;
const SERVER_URL = `ws://localhost:${PORT}`;

let httpServer: HttpServer;
let server: WsServer;
let clients: WsClient[] = [];

describe.each([
    [
        "Bun",
        (ws: WsServerBunAdapter) => new HttpServerBunAdapter(ws),
        (url: string) => new WsClientBunAdapter(url, { headers: { "x-api-key": "1" } }),
    ],
    [
        "Socket.IO",
        () => new HttpServerExpressAdapter(),
        (url: string) => new WsClientSocketIoAdapter(url, { extraHeaders: { "x-api-key": "1" } }),
    ],
] as const)("WsServer (%s)", (name, createHttpServer, createClient) => {
    beforeEach(() => {
        if (name === "Bun") {
            server = new WsServerBunAdapter();
            httpServer = createHttpServer(server as WsServerBunAdapter);
            httpServer.listen(PORT);
            return;
        }
        httpServer = createHttpServer();
        server = new WsServerSocketIoAdapter((httpServer as HttpServerExpressAdapter).http);
        httpServer.listen(PORT);
    });

    afterEach(async () => {
        clients.forEach((connection) => connection.close());
        clients = [];
        await httpServer.close();
    });

    const connect = (): WsClient => {
        const connection: WsClient = createClient(SERVER_URL);
        clients.push(connection);
        return connection;
    };

    it("Should notify on connection", (done) => {
        server.on("connection", (socket) => {
            expect(socket.emit).toBeTypeOf("function");
            done();
        });
        connect();
    });
    it("Should send a message to one client", (done) => {
        const client = connect();
        client.on(FOO_MESSAGE, (data: FooData) => {
            expect(data.name).toBe("John Doe");
            done();
        });
        server.on("connection", (socket) => {
            socket.emit<FooData>(FOO_MESSAGE, { name: "John Doe" });
        });
    });
    it("Should broadcast an event to all connected clients", (done) => {
        connect();
        connect();
        connect();
        let counter = 0;
        clients.forEach((client) => {
            client.on(FOO_MESSAGE, (data: FooData) => {
                expect(data.name).toBe("John Doe");
                if (++counter === clients.length) done();
            });
        });
        server.on("connection", (socket) => {
            socket.emit<FooData>(FOO_MESSAGE, { name: "John Doe" });
        });
    });
    it("Should send a message from client to server", (done) => {
        const client = connect();
        server.on("connection", (socket) => {
            socket.on(FOO_MESSAGE, (data: FooData) => {
                expect(data.name).toBe("John Doe");
                done();
            });
        });
        client.emit<FooData>(FOO_MESSAGE, { name: "John Doe" });
    });
    it("Should receive headers from client", (done) => {
        server.on("connection", (socket) => {
            expect(socket.headers["x-api-key"]).toBe("1");
            done();
        });
        connect();
    });
});
