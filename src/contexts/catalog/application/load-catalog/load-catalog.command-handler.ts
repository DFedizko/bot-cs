import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { Logger } from "@/packages/application/logger";
import { LoadCatalogCommand } from "./load-catalog.command";
import type { CatalogRepository } from "./catalog.repository";
import type { CatalogSource } from "./catalog.source";

export class LoadCatalogCommandHandler implements CommandHandler<LoadCatalogCommand> {
    constructor(
        private readonly source: CatalogSource,
        private readonly repository: CatalogRepository,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return LoadCatalogCommand.COMMAND_NAME;
    }

    async handle(): Promise<void> {
        const items = await this.source.load();
        await this.repository.saveAll(items);
        this.logger.log(`Catalog loaded: ${items.length} items`);
    }
}
