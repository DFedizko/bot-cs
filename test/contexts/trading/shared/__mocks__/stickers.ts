import { Sticker } from "@/contexts/trading/shared/domain/sticker";
import { StickerType } from "@/shared-kernel/domain/sticker-type";

export const stickers = {
    teamDignitasHoloCologne2014: Sticker.create({
        name: "Team Dignitas (Holo) | Cologne 2014",
        percentageWear: "0.08",
        type: StickerType.HOLO,
        slot: 1,
    }),
    teamDignitasHoloCologne2015: Sticker.create({
        name: "Team Dignitas (Holo) | Cologne 2015",
        type: StickerType.HOLO,
        slot: 2,
    }),
    teamDignitasHoloCologne2016: Sticker.create({
        name: "Team Dignitas (Holo) | Cologne 2016",
        type: StickerType.HOLO,
        slot: 3,
    }),
    teamDignitasHoloCologne2017: Sticker.create({
        name: "Team Dignitas (Holo) | Cologne 2017",
        type: StickerType.HOLO,
        slot: 4,
    }),
    teamDignitasHoloCologne2018: Sticker.create({
        name: "Team Dignitas (Holo) | Cologne 2018",
        type: StickerType.HOLO,
        slot: 5,
    }),
};
