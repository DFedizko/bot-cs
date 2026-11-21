import { ApiDocumentHttpController } from "@/packages/infrastructure/http/docs/api-document.http-controller";
import { DOCUMENT, startDocsServer, type DocsServer } from "./__builders__/docs-server.builder";

let docs: DocsServer;

describe("ApiDocumentHttpController", () => {
    afterEach(async () => {
        await docs.server.close();
    });

    it("Should serve the api document as json", async () => {
        docs = startDocsServer();

        const response = await fetch(`${docs.url}${ApiDocumentHttpController.PATH}`);

        expect(await response.json()).toEqual(DOCUMENT);
    });
});
