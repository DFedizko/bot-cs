import type { FileWriter } from "@/packages/infrastructure/file/file-writer";

export class FileWriterBunAdapter implements FileWriter {
    async write(path: string, content: string): Promise<void> {
        await Bun.write(path, content);
    }
}
