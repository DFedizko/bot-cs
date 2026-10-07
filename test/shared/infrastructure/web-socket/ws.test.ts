import { WsClientBunAdapter } from "@/shared/infrastructure/web-socket/ws-client.bun-adapter";
import { WsServerBunAdapter } from "@/shared/infrastructure/web-socket/ws-server.bun-adapter";

type FooData = {
    name: string;
};

const FOO_MESSAGE = "foo_message";
let SERVER_URL: string;
let server: WsServerBunAdapter;

let clients: WsClientBunAdapter[] = [];

beforeEach(() => {
    server = new WsServerBunAdapter(0);
    SERVER_URL = `ws://localhost:${server.port}`;
});

afterEach(async () => {
    clients.forEach((client) => client.close());
    clients = [];
    await server.close();
});

const connect = () => {
    const connection = new WsClientBunAdapter(SERVER_URL);
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
        clients.forEach((client, index) => {
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
