import { Container } from "inversify";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { Command } from "@/packages/building-blocks/command";
import { FooCommand } from "@/packages/building-blocks/__mocks__/foo.command";
import { PackagesModule } from "@/packages/external/di/packages.module";
import {
    COMMAND_BUS,
    COMMAND_HANDLER,
    ENV,
    EVENT_BUS,
    HTTP_CLIENT_FACTORY,
    HTTP_ERROR_MAPPER,
    HTTP_ERROR_MAPPING,
    HTTP_SERVER,
    LOGGER,
} from "@/packages/external/di/packages.identifiers";
import { HttpErrorMapperByErrorClass } from "@/packages/infrastructure/http/http-error.mapper.by-error-class";
import { HttpServerBunAdapter } from "@/packages/external/http/server/http-server.bun-adapter";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { FooNotFoundError } from "@/packages/infrastructure/http/__stubs__/foo.errors";
import { LoggerConsoleAdapter } from "@/packages/infrastructure/logger/logger.console-adapter";
import { EventBusInMemoryAsync } from "@/packages/external/event-bus/event-bus.in-memory-async";
import { CommandBusInMemory } from "@/packages/infrastructure/command-bus/command-bus.in-memory";
import { HttpClientFactoryAdapter } from "@/packages/external/http/client/http-client.factory.adapter";
import { CommandNotRegisteredError } from "@/packages/error/command-not-registered.error";

const API_KEY = "api-key";
const ENVIRONMENTS: AppEnv["NODE_ENV"][] = ["development", "production"];

let container: Container;
let fooHandler: CommandHandler<Command>;

describe.each(ENVIRONMENTS)("PackagesModule in %s", (nodeEnv) => {
    beforeEach(() => {
        fooHandler = { subscribedTo: () => FooCommand.COMMAND_NAME, handle: jest.fn(async () => {}) };
        container = new Container();
        container.load(new PackagesModule({ NODE_ENV: nodeEnv, CSGOEMPIRE_API_KEY: API_KEY }));
    });

    it("Should bind the validated enviroment", () => {
        const env = container.get(ENV);

        expect(env).toEqual({ NODE_ENV: nodeEnv, CSGOEMPIRE_API_KEY: API_KEY });
    });

    it("Should bind the console logger", () => {
        const logger = container.get(LOGGER);

        expect(logger).toBeInstanceOf(LoggerConsoleAdapter);
    });

    it("Should bind the async in-memory event bus", () => {
        const eventBus = container.get(EVENT_BUS);

        expect(eventBus).toBeInstanceOf(EventBusInMemoryAsync);
    });

    it("Should bind the http client factory", () => {
        const httpClientFactory = container.get(HTTP_CLIENT_FACTORY);

        expect(httpClientFactory).toBeInstanceOf(HttpClientFactoryAdapter);
    });

    it("Should bind one in-memory command bus", () => {
        const commandBus = container.get(COMMAND_BUS);

        expect(container.get(COMMAND_BUS)).toBe(commandBus);
    });

    it("Should bind the in-memory command bus with no handlers", async () => {
        const commandBus = container.get(COMMAND_BUS);

        await expect(commandBus.dispatch(new FooCommand())).rejects.toThrow(CommandNotRegisteredError);
    });

    it("Should register every bound command handler on the command bus", async () => {
        container.bind(COMMAND_HANDLER).toConstantValue(fooHandler);
        const commandBus = container.get(COMMAND_BUS);

        await commandBus.dispatch(new FooCommand());

        expect(fooHandler.handle).toHaveBeenCalled();
    });

    it("Should resolve the command bus as the in-memory adapter", () => {
        const commandBus = container.get(COMMAND_BUS);

        expect(commandBus).toBeInstanceOf(CommandBusInMemory);
    });

    it("Should bind the error class http error mapper", () => {
        const errorMapper = container.get(HTTP_ERROR_MAPPER);

        expect(errorMapper).toBeInstanceOf(HttpErrorMapperByErrorClass);
    });

    it("Should map errors with every bound http error mapping", () => {
        container.bind(HTTP_ERROR_MAPPING).toConstantValue({ error: FooNotFoundError, status: HttpStatus.NOT_FOUND });
        const errorMapper = container.get(HTTP_ERROR_MAPPER);

        const response = errorMapper.map(new FooNotFoundError());

        expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it("Should bind the bun http server", () => {
        const httpServer = container.get(HTTP_SERVER);

        expect(httpServer).toBeInstanceOf(HttpServerBunAdapter);
    });

    it("Should bind one http server", () => {
        const httpServer = container.get(HTTP_SERVER);

        expect(container.get(HTTP_SERVER)).toBe(httpServer);
    });
});
