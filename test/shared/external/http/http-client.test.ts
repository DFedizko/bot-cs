import { HttpClientAxiosAdapter } from "@/shared/external/http/client/http-client.axios-adapter";
import type { HttpClient } from "@/shared/infrastructure/http/http-client";
import { HttpClientFetchAdapter } from "@/shared/external/http/client/http-client.fetch-adapter";
import type { HttpServer } from "@/shared/infrastructure/http/http-server";
import { HttpServerBunAdapter } from "@/shared/external/http/server/http-server.bun-adapter";
import { type Post, post } from "./__mocks__/data";

const PORT = 8888;
let httpClient: HttpClient;
let httpServer: HttpServer;

describe.each([
    ["Fetch", () => new HttpClientFetchAdapter(`http://localhost:${PORT}`, { keepAlive: false })],
    ["Axios", () => new HttpClientAxiosAdapter(`http://localhost:${PORT}`, { keepAlive: false })],
])("Http Client %s Adapter", (_name, createClient) => {
    beforeEach(() => {
        httpServer = new HttpServerBunAdapter();
        httpClient = createClient();
    });

    afterEach(async () => await httpServer.close());

    it("GET", async () => {
        httpServer.get("/posts/1", () => ({ body: post }));
        httpServer.listen(PORT);
        const data = await httpClient.get<Post>("/posts/1");
        expect(data).toMatchObject(post);
    });
    it("POST", async () => {
        httpServer.post("/posts", (req) => {
            const { body, title, userId } = req.body as Omit<Post, "id">;
            return { body: { id: 1, userId, body, title } };
        });
        httpServer.listen(PORT);
        const data = await httpClient.post<Post, Omit<Post, "id">>("/posts", {
            body: { userId: 1, body: "foo", title: "foo-title" },
        });
        expect(data).toMatchObject({ id: 1, userId: 1, body: "foo", title: "foo-title" });
    });
    it("PATCH", async () => {
        httpServer.patch("/posts/:id", (req) => {
            const { title } = req.body as { title: string };
            return { body: { id: Number(req.params.id), title } };
        });
        httpServer.listen(PORT);
        const data = await httpClient.patch<{ id: number; title: string }, { title: string }>("/posts/1", {
            body: { title: "foo-title" },
        });
        expect(data).toMatchObject({ id: 1, title: "foo-title" });
    });
    it("PUT", async () => {
        httpServer.put("/posts", (req) => {
            const { body, title, userId } = req.body as Omit<Post, "id">;
            return { body: { id: 1, userId, body, title } };
        });
        httpServer.listen(PORT);
        const data = await httpClient.put<Post, Omit<Post, "id">>("/posts", {
            body: { userId: 1, body: "foo", title: "foo-title" },
        });
        expect(data).toMatchObject({ id: 1, userId: 1, body: "foo", title: "foo-title" });
    });
    it("DELETE", async () => {
        httpServer.get("/posts/:id", (req) => ({ body: { id: Number(req.params.id) } }));
        httpServer.listen(PORT);
        const data = await httpClient.get<Post>("/posts/1");
        expect(data).toMatchObject({ id: 1 });
    });
});
