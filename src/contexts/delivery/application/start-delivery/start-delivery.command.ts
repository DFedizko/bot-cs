import { Command } from "@/packages/building-blocks/command";

export type StartDeliveryProps = {
    tradeId: number;
    tradeOfferId: number;
    accountId: number;
    assetId: string;
    marketName: string;
    appId: number;
    sellerSteamId?: string;
};

export class StartDeliveryCommand extends Command {
    static readonly COMMAND_NAME = "start_delivery";
    readonly tradeId: number;
    readonly tradeOfferId: number;
    readonly accountId: number;
    readonly assetId: string;
    readonly marketName: string;
    readonly appId: number;
    readonly sellerSteamId?: string;

    constructor(props: StartDeliveryProps) {
        super();
        this.tradeId = props.tradeId;
        this.tradeOfferId = props.tradeOfferId;
        this.accountId = props.accountId;
        this.assetId = props.assetId;
        this.marketName = props.marketName;
        this.appId = props.appId;
        this.sellerSteamId = props.sellerSteamId;
    }
}
