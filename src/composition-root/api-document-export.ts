import type { Container } from "inversify";
import { API_DOCUMENT_EXPORTER, HTTP_CONTROLLER } from "@/packages/external/di/packages.identifiers";

export class ApiDocumentExport {
    constructor(private readonly container: Container) {}

    async run(outputPath: string): Promise<void> {
        await this.container.getAllAsync(HTTP_CONTROLLER);
        await this.container.get(API_DOCUMENT_EXPORTER).export(outputPath);
    }
}
