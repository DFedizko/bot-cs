import type { WsClient } from "@/shared/infrastructure/web-socket/ws-client";
import type { OnInitController } from "./on-init.controller";
import type { InitEvent } from "../csgoempire/ws-events/init";
import type { CommandBus } from "@/shared/infrastructure/command-bus/command-bus";
import { InitializeCsgoempireSessionCommand } from "../../application/commands/initialize-csgoempire-session.command";

export class OnInitWsController implements OnInitController {
    constructor(wsClient: WsClient, commandBus: CommandBus) {
        wsClient.on("init", async (data: InitEvent) => {
            await commandBus.dispatch(new InitializeCsgoempireSessionCommand(data.authenticated));
        });
    }
}
