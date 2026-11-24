import { ApiDocumentContainer } from "@/composition-root/api-document-container";
import { ApiDocumentExport } from "@/composition-root/api-document-export";

export const exportedApiDocument = (): Promise<string> =>
    new ApiDocumentExport(new ApiDocumentContainer()).renderJson();
