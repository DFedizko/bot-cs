import { ApiDocumentHttpController } from "@/packages/infrastructure/http/docs/api-document.http-controller";
import { ApiReferenceHttpController } from "@/packages/infrastructure/http/docs/api-reference.http-controller";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { PAGE, startDocsServer, type DocsServer } from "./__builders__/docs-server.builder";

let docs: DocsServer;

const getPage = () => fetch(`${docs.url}${ApiReferenceHttpController.PATH}`);

describe("ApiReferenceHttpController", () => {
    beforeEach(() => {
        docs = startDocsServer();
    });

    afterEach(async () => {
        await docs.server.close();
    });

    it("Should serve the api reference page of the api document", async () => {
        const response = await getPage();

        expect(await response.text()).toBe(`${PAGE}${ApiDocumentHttpController.PATH}`);
    });

    it("Should serve the api reference page as html", async () => {
        const response = await getPage();

        expect(response.headers.get("content-type")).toStartWith("text/html");
    });

    it("Should answer ok on the api reference page", async () => {
        const response = await getPage();

        expect(response.status).toBe(HttpStatus.OK);
    });
});
