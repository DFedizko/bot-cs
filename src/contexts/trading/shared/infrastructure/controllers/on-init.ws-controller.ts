import type { WsClient } from "@/shared/infrastructure/web-socket/ws-client";
import type { OnInitController } from "./on-init.controller";
import type { InitEvent } from "../csgoempire/ws-events/init";
import type { CommandBus } from "@/shared/infrastructure/command-bus/command-bus";
import { InitializeCsgoempireSessionCommand } from "../../application/commands/initialize-csgoempire-session.command";

export class OnInitWsController implements OnInitController {
    constructor(wsClient: WsClient, commandBus: CommandBus) {
        wsClient.on("init", async (data: InitEvent) => {
            await commandBus.dispatch(new InitializeCsgoempireSessionCommand(data.authenticated));
            // console.log(data);
            // if (data && data.authenticated) {
            //     wsClient.emit("filters", {
            //         price_max: 9999999,
            //     });
            //     return;
            // }

            // wsClient.emit("identify", {
            //     uid: metadata.user.id,
            //     model: metadata.user,
            //     authorizationToken: metadata.socket_token,
            //     signature: metadata.socket_signature,
            // });
        });
    }
}
