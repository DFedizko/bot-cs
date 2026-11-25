import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { Logger } from "@/packages/application/logger";
import { LoadCatalogCommand } from "./load-catalog.command";
import type { CatalogSource } from "./catalog.source";
import type { CatalogStore } from "./catalog.store";

export class LoadCatalogCommandHandler implements CommandHandler<LoadCatalogCommand> {
    constructor(
        private readonly source: CatalogSource,
        private readonly store: CatalogStore,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return LoadCatalogCommand.COMMAND_NAME;
    }

    async handle(): Promise<void> {
        const rows = await this.source.load();
        await this.store.replaceAll(rows);
        this.logger.log(`Catalog loaded: ${rows.length} items`);
    }
}
