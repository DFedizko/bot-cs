import { HttpClientAxiosAdapter } from "@/shared/external/http/client/http-client.axios-adapter";
import type { HttpClient } from "@/shared/infrastructure/http/http-client";
import { HttpServerBunAdapter } from "@/shared/external/http/server/http-server.bun-adapter";
import { HttpServerExpressAdapter } from "@/shared/external/http/server/http-server.express-adapter";
import type { HttpServer } from "@/shared/infrastructure/http/http-server";

let httpServer: HttpServer;
let httpClient: HttpClient;

const PORT = 8888;

describe.each([
    ["Bun", () => new HttpServerBunAdapter()],
    ["Express", () => new HttpServerExpressAdapter()],
])("Http Server %s Adapter", (_name, createServer) => {
    beforeEach(() => {
        httpServer = createServer();
        httpClient = new HttpClientAxiosAdapter(`http://localhost:${PORT}`, { keepAlive: false });
    });

    afterEach(async () => {
        await httpServer.close();
    });

    it("Should register a get route", async () => {
        httpServer.get("/test", () => ({ body: { received: true } }));
        httpServer.listen(PORT);
        const response = await httpClient.get<{ received: boolean }>("/test");
        expect(response.received).toBe(true);
    });
    it("Should register a post route", async () => {
        httpServer.post("/test", (req) => ({ body: req.body }));
        httpServer.listen(PORT);
        const res = await httpClient.post<{ name: string }>("/test", { body: { name: "John Doe" } });
        expect(res.name).toBe("John Doe");
    });
    it("Should register a patch route", async () => {
        httpServer.patch("/test", (req) => ({ body: req.body }));
        httpServer.listen(PORT);
        const res = await httpClient.patch<{ name: string }>("/test", { body: { name: "John Doe" } });
        expect(res.name).toBe("John Doe");
    });
    it("Should register a put route", async () => {
        httpServer.put("/test", (req) => ({ body: req.body }));
        httpServer.listen(PORT);
        const res = await httpClient.put<{ name: string }>("/test", { body: { name: "John Doe" } });
        expect(res.name).toBe("John Doe");
    });

    it("Should register a delete route", async () => {
        httpServer.delete("/test", () => ({ body: { name: "John Doe" } }));
        httpServer.listen(PORT);
        const res = await httpClient.delete<{ name: string }>("/test");
        expect(res.name).toBe("John Doe");
    });
    it("Should receive headers", async () => {
        httpServer.get("/test", (req) => {
            expect(req.headers["x-api-key"]).toBe("1");
            expect(req.headers["cache-control"]).toBe("no-cache");
            return {};
        });
        httpServer.listen(PORT);
        await httpClient.get("/test", { headers: { "x-api-key": "1", "cache-control": "no-cache" } });
    });
    it("Should receive cookies", async () => {
        httpServer.get("/test", (req) => {
            expect(req.cookies).toEqual({ token: "123" });
            return {};
        });
        httpServer.listen(PORT);
        await httpClient.get("/test", { headers: { cookie: "token=123" } });
    });
    it("Should set cookies and use them in subsequent requests", async () => {
        httpServer.post("/login", () => ({ cookies: { token: { value: "123123123", httpOnly: true } } }));
        httpServer.get("/test", (req) => {
            expect(req.cookies).toMatchObject({ token: "123123123" });
            return {};
        });
        httpServer.listen(PORT);
        await httpClient.post("/login");
        await httpClient.get("/test");
    });
    it("Should clear cookies", async () => {
        httpServer.post("/login", () => ({ cookies: { token: { value: "123123123", httpOnly: true } } }));
        httpServer.post("/logout", (req) => {
            expect(req.cookies).toMatchObject({ token: "123123123" });
            return { clearCookies: ["token"] };
        });
        httpServer.get("/me", (req) => {
            expect(req.cookies).toMatchObject({});
            return {};
        });
        httpServer.listen(PORT);
        await httpClient.post("/login");
        await httpClient.post("/logout");
        await httpClient.get("/me");
    });
    it("Should receive path params", async () => {
        httpServer.get("/test/:id", (req) => {
            expect(req.params).toMatchObject({ id: "2" });
            return {};
        });
        httpServer.listen(PORT);
        await httpClient.get("/test/2");
    });
    it("Should send and receive search params", async () => {
        httpServer.get("/test", (req) => {
            expect(req.searchParams).toMatchObject({ id: "2", name: "John Doe" });
            return {};
        });
        httpServer.listen(PORT);
        await httpClient.get("/test?id=2&name=John Doe");
    });
    it("Should throw an error when send request to a non-existent route", () => {
        httpServer.listen(PORT);
        expect(httpClient.get("/test")).rejects.toThrow(Error);
    });
});
