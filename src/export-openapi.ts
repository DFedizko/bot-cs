import { ApiDocumentContainer } from "./composition-root/api-document-container";
import { ApiDocumentExport } from "./composition-root/api-document-export";

const DEFAULT_OUTPUT_PATH = "openapi.json";
const [, , outputPath = DEFAULT_OUTPUT_PATH] = Bun.argv;

await new ApiDocumentExport(new ApiDocumentContainer()).run(outputPath);
