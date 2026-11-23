import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { HTTP_SERVER } from "@/packages/external/di/packages.identifiers";
import { exportedApiDocument } from "./__builders__/exported-api-document.builder";
import { servedApiDocument } from "./__builders__/served-api-document.builder";

const SERVED_ENV = "development";

let served: Container;

describe("ApiDocumentExport", () => {
    beforeEach(() => {
        served = testContainer(SERVED_ENV);
    });

    afterEach(async () => {
        await served.get(HTTP_SERVER).close();
    });

    it("Should export exactly the document the development app serves", async () => {
        const document = await servedApiDocument(served);

        const exported = await exportedApiDocument();

        expect(exported).toBe(document);
    });
});
