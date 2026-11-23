import { Container } from "inversify";
import { PackagesModule } from "@/packages/external/di/packages.module";
import { PackagesDevModule } from "@/packages/external/di/packages.dev-module";
import { API_DOCUMENT, API_DOCUMENT_EXPORTER, FILE_WRITER } from "@/packages/external/di/packages.identifiers";
import { FileWriterBunAdapter } from "@/packages/external/file/file-writer.bun-adapter";
import type { ApiDocument } from "@/packages/infrastructure/http/docs/api-document";
import { ApiDocumentExporter } from "@/packages/infrastructure/http/docs/api-document.exporter";
import type { FileWriter } from "@/packages/infrastructure/file/file-writer";
import { HTTP_MODULES } from "./http-modules";

const UNUSED_API_KEY = "";
const UNUSED_PORT = 0;
const DOCUMENTED_ENV: AppEnv = {
    NODE_ENV: "development",
    CSGOEMPIRE_API_KEY: UNUSED_API_KEY,
    HTTP_PORT: UNUSED_PORT,
};

export class ApiDocumentContainer extends Container {
    constructor() {
        super();
        this.load(new PackagesModule(DOCUMENTED_ENV), ...HTTP_MODULES(), new PackagesDevModule());
        this.bind(FILE_WRITER)
            .toResolvedValue(() => new FileWriterBunAdapter())
            .inSingletonScope();
        this.bind(API_DOCUMENT_EXPORTER)
            .toResolvedValue(
                (document: ApiDocument, writer: FileWriter) => new ApiDocumentExporter(document, writer),
                [API_DOCUMENT, FILE_WRITER],
            )
            .inSingletonScope();
    }
}
