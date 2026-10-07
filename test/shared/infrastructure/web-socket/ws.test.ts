import type { WsClient } from "@/shared/infrastructure/web-socket/client/ws-client";
import { WsClientBunAdapter } from "@/shared/infrastructure/web-socket/client/ws-client.bun-adapter";
import { WsClientSocketIoAdapter } from "@/shared/infrastructure/web-socket/client/ws-client.socket-io-adapter";
import { WsServer } from "@/shared/infrastructure/web-socket/server/ws-server";
import { WsServerBunAdapter } from "@/shared/infrastructure/web-socket/server/ws-server.bun-adapter";
import { WsServerSocketIoAdapter } from "@/shared/infrastructure/web-socket/server/ws-server.socket-io-adapter";
import { createServer } from "node:http";

type FooData = {
    name: string;
};

const FOO_MESSAGE = "foo_message";
let SERVER_URL: string;
let server: WsServer;
let clients: WsClient[] = [];

beforeEach(() => {
    const http = createServer();
    server = new WsServerSocketIoAdapter(http);
    http.listen(9999);
    SERVER_URL = `ws://localhost:${server.port}`;
});

afterEach(async () => {
    clients.forEach((client) => client.close());
    clients = [];
    await server.close();
});

const connect = () => {
    const connection = new WsClientSocketIoAdapter(SERVER_URL);
    clients.push(connection);
    return connection;
};

describe("WsServerBunAdapter", () => {
    it("Should initialize a ws server", () => expect(server.port).toBeTypeOf("number"));
    it("Should notify on connection", (done) => {
        server.on("connection", (socket) => {
            expect(socket.send).toBeTypeOf("function");
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
            socket.send<FooData>(FOO_MESSAGE, { name: "John Doe" });
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
            socket.send<FooData>(FOO_MESSAGE, { name: "John Doe" });
        });
    });
});
