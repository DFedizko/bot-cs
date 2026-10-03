import { ValueObject } from "@value-object";
import { ItemName } from "./item-name";
import { PercentageWear } from "./percentage-wear";
import { StickerType } from "@/shared-kernel/domain/sticker-type";
import { StickerSlot } from "./sticker-slot";

type CreateStickerProps = {
    name: string;
    percentageWear?: string;
    type: StickerType;
    slot: number;
};

export class Sticker extends ValueObject<{
    name: ItemName;
    percentageWear?: PercentageWear;
    type: StickerType;
    slot: StickerSlot;
}> {
    private constructor(props: CreateStickerProps) {
        super({
            name: ItemName.create(props.name),
            ...(props.percentageWear && { percentageWear: PercentageWear.fromFraction(props.percentageWear) }),
            type: props.type,
            slot: new StickerSlot(props.slot),
        });
    }

    static create(props: CreateStickerProps): Sticker {
        return new Sticker(props);
    }

    getName(): string {
        return this.value.name.getValue();
    }

    getWear(): string | undefined {
        return this.value.percentageWear?.getFraction();
    }

    getType(): StickerType {
        return this.value.type;
    }

    getSlot(): number {
        return this.value.slot.getValue();
    }
}
