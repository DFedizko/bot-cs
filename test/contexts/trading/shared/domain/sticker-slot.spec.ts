import { StickerSlot } from "@/contexts/trading/shared/domain/sticker-slot";
import { DomainError } from "@/shared/error/domain-error";

test("Should create a sticker position object", () => expect(new StickerSlot(5).getValue()).toBe(5));
test("Should throw an error when sticker position is decimal", () =>
    expect(() => new StickerSlot(0.1)).toThrow(DomainError));
test("Should throw an error when sticker position is less than 1 or bigger than 5", () => {
    expect(() => new StickerSlot(0)).toThrow(DomainError);
    expect(() => new StickerSlot(6)).toThrow(DomainError);
});
