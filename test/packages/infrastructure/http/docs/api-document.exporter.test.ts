import { ApiDocumentExporter } from "@/packages/infrastructure/http/docs/api-document.exporter";
import type { ApiDocument } from "@/packages/infrastructure/http/docs/api-document";
import { FileWriterFakeAdapter } from "@/packages/external/file/file-writer.fake-adapter";

const OUTPUT_PATH = "out/foo.json";
const DOCUMENT = { openapi: "3.1.0", paths: { "/foos": {} } };
const fooDocument: ApiDocument = { toJson: () => DOCUMENT };

describe("ApiDocumentExporter", () => {
    it("Should write the document as json to the given path", async () => {
        const writer = new FileWriterFakeAdapter();

        await new ApiDocumentExporter(fooDocument, writer).export(OUTPUT_PATH);

        expect(writer.files).toEqual(new Map([[OUTPUT_PATH, JSON.stringify(DOCUMENT)]]));
    });
});
