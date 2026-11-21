import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import type { Command } from "@/packages/building-blocks/command";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { CommandBusInMemory } from "@/packages/infrastructure/command-bus/command-bus.in-memory";
import { LoggerConsoleAdapter } from "@/packages/infrastructure/logger/logger.console-adapter";
import { EventBusInMemoryAsync } from "../event-bus/event-bus.in-memory-async";
import { EventBusInMemorySync } from "../event-bus/event-bus.in-memory-sync";
import { HttpClientFactoryAdapter } from "../http/client/http-client.factory.adapter";
import { HttpServerBunAdapter } from "../http/server/http-server.bun-adapter";
import type { HttpErrorMapper, HttpErrorMapping } from "@/packages/infrastructure/http/http-error.mapper";
import { HttpErrorMapperByErrorClass } from "@/packages/infrastructure/http/http-error.mapper.by-error-class";
import { HttpErrorMapperLoggingDecorator } from "@/packages/infrastructure/http/http-error.mapper.logging-decorator";
import type { Logger } from "@/packages/application/logger";
import {
    ASYNC_EVENT_BUS,
    COMMAND_BUS,
    COMMAND_HANDLER,
    ENV,
    EVENT_BUS,
    HTTP_CLIENT_FACTORY,
    HTTP_ERROR_MAPPER,
    HTTP_ERROR_MAPPING,
    HTTP_SERVER,
    LOGGER,
} from "./packages.identifiers";

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
            .toResolvedValue(() => new EventBusInMemorySync())
            .inSingletonScope();
        bind(ASYNC_EVENT_BUS)
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
        bind(HTTP_ERROR_MAPPER)
            .toResolvedValue(PackagesModule.createErrorMapper, [
                LOGGER,
                { serviceIdentifier: HTTP_ERROR_MAPPING, isMultiple: true, optional: true },
            ])
            .inSingletonScope();
        bind(HTTP_SERVER)
            .toResolvedValue(
                (errorMapper: HttpErrorMapper) => new HttpServerBunAdapter(undefined, errorMapper),
                [HTTP_ERROR_MAPPER],
            )
            .inSingletonScope();
    }

    private static createErrorMapper(logger: Logger, mappings: HttpErrorMapping[] | undefined): HttpErrorMapper {
        return new HttpErrorMapperLoggingDecorator(new HttpErrorMapperByErrorClass(mappings), logger);
    }

    private static createCommandBus(handlers: CommandHandler<Command>[] | undefined): CommandBusInMemory {
        const commandBus = new CommandBusInMemory();
        handlers?.forEach((handler) => commandBus.register(handler));
        return commandBus;
    }
}
