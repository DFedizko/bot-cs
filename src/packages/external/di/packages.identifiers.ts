import type { CommandBus } from "@/packages/application/command-bus";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { Command } from "@/packages/building-blocks/command";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { HttpClientFactory } from "../http/client/http-client.factory";
import { identifier } from "./identifier";

export const ENV = identifier<AppEnv>("Env");
export const LOGGER = identifier<Logger>("Logger");
export const EVENT_BUS = identifier<EventBus>("EventBus");
export const COMMAND_BUS = identifier<CommandBus>("CommandBus");
export const COMMAND_HANDLER = identifier<CommandHandler<Command>>("CommandHandler");
export const HTTP_CLIENT_FACTORY = identifier<HttpClientFactory>("HttpClientFactory");
