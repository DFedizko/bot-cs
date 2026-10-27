import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import type { HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpServerBunAdapter } from "@/packages/external/http/server/http-server.bun-adapter";
import { type Post, post } from "./__mocks__/data";
import {
    HttpClientFactoryAdapter,
    type HttpClientProvider,
} from "@/packages/external/http/client/http-client.factory.adapter";

const PORT = 8888;
let httpClient: HttpClient;
let httpServer: HttpServer;

describe.each([["Fetch"], ["Axios"]])("Http Client %s Adapter", (name) => {
    beforeEach(() => {
        httpServer = new HttpServerBunAdapter();
        httpClient = new HttpClientFactoryAdapter(name.toLowerCase() as HttpClientProvider).create(
            `http://localhost:${PORT}`,
            {
                keepAlive: false,
                defaultHeaders: { "x-api-key": "1" },
            },
        );
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
    it("Should send default headers", async () => {
        httpServer.get("/posts", (req) => ({ body: req.headers }));
        httpServer.listen(PORT);
        const data = await httpClient.get("/posts");
        expect(data).toMatchObject({ "x-api-key": "1" });
    });
});
