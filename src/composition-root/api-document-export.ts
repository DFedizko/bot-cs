import type { Container } from "inversify";
import { API_DOCUMENT, HTTP_CONTROLLER } from "@/packages/external/di/packages.identifiers";

export class ApiDocumentExport {
    constructor(private readonly container: Container) {}

    async renderJson(): Promise<string> {
        await this.container.getAllAsync(HTTP_CONTROLLER);
        return JSON.stringify(this.container.get(API_DOCUMENT).toJson());
    }
}
