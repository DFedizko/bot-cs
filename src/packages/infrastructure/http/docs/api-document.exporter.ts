import type { FileWriter } from "../../file/file-writer";
import type { ApiDocument } from "./api-document";

export class ApiDocumentExporter {
    constructor(
        private readonly apiDocument: ApiDocument,
        private readonly fileWriter: FileWriter,
    ) {}

    async export(path: string): Promise<void> {
        await this.fileWriter.write(path, JSON.stringify(this.apiDocument.toJson()));
    }
}
