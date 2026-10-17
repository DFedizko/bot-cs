import { BoundedString } from "@/shared/domain-primitives/bounded-string";

export class StickerName extends BoundedString {
    constructor(value: string) {
        super(value, { min: 2, max: 100, label: "sticker name" });
    }
}
