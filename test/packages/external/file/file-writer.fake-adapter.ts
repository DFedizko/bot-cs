import type { FileWriter } from "@/packages/infrastructure/file/file-writer";

export class FileWriterFakeAdapter implements FileWriter {
    readonly files = new Map<string, string>();

    async write(path: string, content: string): Promise<void> {
        this.files.set(path, content);
    }
}
