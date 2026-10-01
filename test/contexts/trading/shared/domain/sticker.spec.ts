import { Sticker } from "@/contexts/trading/shared/domain/sticker";
import { StickerType } from "@/shared-kernel/domain/sticker-type";

describe("Sticker", () => {
    it("Should create a sticker object", () => {
        const sticker = Sticker.create({
            name: "Team Dignitas (Holo) | Cologne 2014",
            percentageWear: "0.08",
            type: StickerType.HOLO,
            slot: 5,
        });
        expect(sticker.getName()).toBe("Team Dignitas (Holo) | Cologne 2014");
        expect(sticker.getWear()).toBe("0.08");
        expect(sticker.getType()).toBe(StickerType.HOLO);
        expect(sticker.getSlot()).toBe(5);
    });
});
