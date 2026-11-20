import { ValueObject } from "@/packages/building-blocks/value-object";

export type OfferItem = { assetId: string; appId: number };

export type ReceivedOfferProps = {
    id: string;
    partnerSteamId: string;
    isActive: boolean;
    isGlitched: boolean;
    escrowDays: number;
    itemsToGive: readonly OfferItem[];
    itemsToReceive: readonly OfferItem[];
};

export class ReceivedOffer extends ValueObject<ReceivedOfferProps> {
    static create(props: ReceivedOfferProps): ReceivedOffer {
        return new ReceivedOffer({
            ...props,
            itemsToGive: [...props.itemsToGive],
            itemsToReceive: [...props.itemsToReceive],
        });
    }

    getId(): string {
        return this.value.id;
    }

    getPartnerSteamId(): string {
        return this.value.partnerSteamId;
    }

    isActive(): boolean {
        return this.value.isActive;
    }

    isGlitched(): boolean {
        return this.value.isGlitched;
    }

    getEscrowDays(): number {
        return this.value.escrowDays;
    }

    getItemsToGive(): readonly OfferItem[] {
        return this.value.itemsToGive;
    }

    getItemsToReceive(): readonly OfferItem[] {
        return this.value.itemsToReceive;
    }
}
