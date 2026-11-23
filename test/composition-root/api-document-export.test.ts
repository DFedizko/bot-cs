import type { Container } from "inversify";
import { ApiDocumentContainer } from "@/composition-root/api-document-container";
import { ApiDocumentExport } from "@/composition-root/api-document-export";
import { testContainer } from "@/__builders__/test-container.builder";
import { FILE_WRITER, HTTP_SERVER } from "@/packages/external/di/packages.identifiers";
import { FileWriterFakeAdapter } from "@/packages/external/file/file-writer.fake-adapter";
import { servedApiDocument } from "./__builders__/served-api-document.builder";

const SERVED_ENV = "development";
const OUTPUT_PATH = "docs/openapi.json";

const exportDocument = async (): Promise<string | undefined> => {
    const container = new ApiDocumentContainer();
    const writer = new FileWriterFakeAdapter();
    container.rebind(FILE_WRITER).toConstantValue(writer);
    await new ApiDocumentExport(container).run(OUTPUT_PATH);
    return writer.files.get(OUTPUT_PATH);
};

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

        const exported = await exportDocument();

        expect(exported).toBe(document);
    });
});
