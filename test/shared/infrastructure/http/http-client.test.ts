import { HttpClientAxiosAdapter } from "@/shared/infrastructure/http/http-client.axios-adapter";
import { HttpClient } from "@/shared/infrastructure/http/http-client";

let httpClient: HttpClient;

beforeEach(() => (httpClient = new HttpClientAxiosAdapter("https://jsonplaceholder.typicode.com")));

describe("HttpClient", () => {
    it("GET", async () => {
        const data = await httpClient.get<{ userId: number; id: number; title: string; body: string }>("/posts/1");
        expect(data).toMatchObject({
            userId: 1,
            id: 1,
            title: "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
            body: "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto",
        });
    });
    it("POST", async () => {
        const data = await httpClient.post<
            { userId: number; id: number; title: string; body: string },
            { title: string; body: string; userId: number }
        >("/posts", { body: { title: "foo", body: "bar", userId: 1 } });
        expect(data).toMatchObject({
            title: "foo",
            body: "bar",
            userId: 1,
            id: 101,
        });
    });
});
