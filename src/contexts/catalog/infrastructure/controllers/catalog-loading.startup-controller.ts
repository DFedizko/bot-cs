import type { CommandDispatcher } from "@/packages/infrastructure/command-bus/command-dispatcher";
import { LoadCatalogCommand } from "../../application/load-catalog/load-catalog.command";

export class CatalogLoadingStartupController {
    private static readonly CONTEXT = { trigger: "startup" };

    constructor(private readonly dispatcher: CommandDispatcher) {}

    start(): Promise<void> {
        return this.dispatcher.dispatch(new LoadCatalogCommand(), CatalogLoadingStartupController.CONTEXT);
    }
}
