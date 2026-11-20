import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import type { Command } from "@/packages/building-blocks/command";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { CommandBusInMemory } from "@/packages/infrastructure/command-bus/command-bus.in-memory";
import { LoggerConsoleAdapter } from "@/packages/infrastructure/logger/logger.console-adapter";
import { EventBusInMemoryAsync } from "../event-bus/event-bus.in-memory-async";
import { HttpClientFactoryAdapter } from "../http/client/http-client.factory.adapter";
import { COMMAND_BUS, COMMAND_HANDLER, ENV, EVENT_BUS, HTTP_CLIENT_FACTORY, LOGGER } from "./packages.identifiers";

const HTTP_CLIENT_PROVIDER = "axios";

export class PackagesModule extends ContainerModule {
    constructor(env: AppEnv) {
        super((options) => PackagesModule.bindAll(options, env));
    }

    private static bindAll({ bind }: ContainerModuleLoadOptions, env: AppEnv): void {
        bind(ENV).toConstantValue(env);
        bind(LOGGER)
            .toResolvedValue(() => new LoggerConsoleAdapter())
            .inSingletonScope();
        bind(EVENT_BUS)
            .toResolvedValue(() => new EventBusInMemoryAsync())
            .inSingletonScope();
        bind(HTTP_CLIENT_FACTORY)
            .toResolvedValue(() => new HttpClientFactoryAdapter(HTTP_CLIENT_PROVIDER))
            .inSingletonScope();
        bind(COMMAND_BUS)
            .toResolvedValue(PackagesModule.createCommandBus, [
                { serviceIdentifier: COMMAND_HANDLER, isMultiple: true, optional: true },
            ])
            .inSingletonScope();
    }

    private static createCommandBus(handlers: CommandHandler<Command>[] | undefined): CommandBusInMemory {
        const commandBus = new CommandBusInMemory();
        handlers?.forEach((handler) => commandBus.register(handler));
        return commandBus;
    }
}
