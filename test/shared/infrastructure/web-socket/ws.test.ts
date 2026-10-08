import { HttpStatus } from "@/shared/infrastructure/http/http-status";
import type { WsClient } from "@/shared/infrastructure/web-socket/client/ws-client";
import { WsClientBunAdapter } from "@/shared/infrastructure/web-socket/client/ws-client.bun-adapter";
import { WsClientSocketIoAdapter } from "@/shared/infrastructure/web-socket/client/ws-client.socket-io-adapter";
import { WsServer } from "@/shared/infrastructure/web-socket/server/ws-server";
import { WsServerBunAdapter } from "@/shared/infrastructure/web-socket/server/ws-server.bun-adapter";
import { WsServerSocketIoAdapter } from "@/shared/infrastructure/web-socket/server/ws-server.socket-io-adapter";
import { createServer } from "node:http";
import { AddressInfo } from "node:net";

type FooData = {
    name: string;
};
const FOO_MESSAGE = "foo_message";

let server: WsServer;
let SERVER_URL: string;
let clients: WsClient[] = [];
let stop: () => Promise<void> | void;

const setupBun = () => {
    const ws = new WsServerBunAdapter();
    const bun = Bun.serve({
        port: 0,
        fetch: (req, server) => {
            if (server.upgrade(req)) return;
            return new Response("Upgrade failed", { status: HttpStatus.INTERNAL_SERVER_ERROR });
        },
        websocket: ws.websocket,
    });
    ws.attatch(bun);
    server = ws;
    SERVER_URL = `ws://localhost:${bun.port}`;
    stop = () => bun.stop(true);
};

const setupSocketIo = async () => {
    const http = createServer();
    server = new WsServerSocketIoAdapter(http);
    await new Promise<void>((res) => http.listen(0, res));
    SERVER_URL = `ws://localhost:${(http.address() as AddressInfo).port}`;
    stop = () =>
        new Promise<void>((res) => {
            http.closeAllConnections();
            http.close(() => res());
        });
};

describe.each([
    ["Bun", setupBun, (url: string) => new WsClientBunAdapter(url)],
    ["Socket.IO", setupSocketIo, (url: string) => new WsClientSocketIoAdapter(url)],
] as const)("WsServer (%s)", (_name, setup, createClient) => {
    beforeEach(async () => {
        await setup();
    });

    afterEach(async () => {
        clients.forEach((connection) => connection.close());
        clients = [];
        await stop();
    });

    const connect = () => {
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
});
