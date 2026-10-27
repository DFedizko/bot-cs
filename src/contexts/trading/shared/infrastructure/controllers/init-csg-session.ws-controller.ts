import type { WsClient } from "@/packages/infrastructure/web-socket/ws-client";
import type { InitCsgSessionController } from "./init-csg-session.controller";
import type { InitEvent } from "../csgoempire/ws-events/init";
import type { GetSocketMetadataIO, SocketMetadataGateway } from "../csgoempire/http/socket-metadata.gateway";
import { BaseError } from "@/packages/building-blocks/base-error";
import type { Logger } from "@/packages/application/logger";

const MS_IN_SECONDS = 1000;
const FIFTEEN_SECONDS = 15;
const PRICE_MAX_FILTER_VALUE = 9999999;

export class InitCsgSessionWsController implements InitCsgSessionController {
    private userData: GetSocketMetadataIO.Response | null = null;
    private userDataRefreshedAt: number | null = null;

    constructor(
        wsClient: WsClient,
        private readonly socketMetadataGateway: SocketMetadataGateway,
        private readonly logger: Logger,
    ) {
        wsClient.on("init", async (data: InitEvent) => {
            if (data && data.authenticated) {
                this.logger.log(`Successfully authenticated as ${data.name}`);
                wsClient.emit("filters", { price_max: PRICE_MAX_FILTER_VALUE });
                return;
            }
            await this.refreshUserData();
            wsClient.emit("identify", {
                uid: this.userData!.user.id,
                model: this.userData!.user,
                authorizationToken: this.userData!.socket_token,
                signature: this.userData!.socket_signature,
            });
        });
    }

    private async refreshUserData(): Promise<void> {
        if (this.userDataRefreshedLessThan(FIFTEEN_SECONDS)) return;
        try {
            this.userData = await this.socketMetadataGateway.getSocketMetadata();
            this.userDataRefreshedAt = Date.now();
        } catch (error: unknown) {
            if (error instanceof BaseError) this.logger.log(`Failed to refresh user data: ${error.message}`);
            throw error;
        }
    }

    private userDataRefreshedLessThan(seconds: number): boolean {
        return !!(this.userDataRefreshedAt && this.userDataRefreshedAt > Date.now() - seconds * MS_IN_SECONDS);
    }
}
