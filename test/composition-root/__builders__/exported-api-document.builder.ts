import { ApiDocumentContainer } from "@/composition-root/api-document-container";
import { ApiDocumentExport } from "@/composition-root/api-document-export";
import { FILE_WRITER } from "@/packages/external/di/packages.identifiers";
import { FileWriterFakeAdapter } from "@/packages/external/file/file-writer.fake-adapter";

const OUTPUT_PATH = "openapi.json";

export const exportedApiDocument = async (): Promise<string | undefined> => {
    const container = new ApiDocumentContainer();
    const writer = new FileWriterFakeAdapter();
    container.rebind(FILE_WRITER).toConstantValue(writer);
    await new ApiDocumentExport(container).run(OUTPUT_PATH);
    return writer.files.get(OUTPUT_PATH);
};
