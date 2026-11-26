import { WearPill } from "@/shared/ui/components/wear-pill";
import type { WantedItemView } from "../../model/wanted-item-view";
import { ITEM_IMAGE_SIZE } from "./item-image-size";
import { ItemActionsMenu } from "./item-actions-menu";
import { MaxBadgeNote } from "./max-badge";
import { PausedMark } from "./paused-mark";
import { WantedItemMax } from "./wanted-item-max";
import {
    WantedItemRow,
    WantedItemRowCaption,
    WantedItemRowCell,
    WantedItemRowImage,
    WantedItemRowName,
    WantedItemRowTile,
    WantedItemRowTitle,
} from "./wanted-item-row";
import { WantedItemSwitch } from "./wanted-item-switch";
import { WantedItemTags } from "./wanted-item-tags";

type WantedItemsListProps = { items: Array<WantedItemView>; onToggle: (name: string, enabled: boolean) => void };

const NO_CATALOG = "No catalog data";

export function WantedItemsList({ items, onToggle }: WantedItemsListProps) {
    return (
        <ul aria-label="Wanted items" className="flex flex-col rounded-lg border border-b-0 border-line">
            {items.map((item) => (
                <li key={item.name}>
                    <WantedItemRow name={item.name} enabled={item.enabled}>
                        <WantedItemRowTile tone={item.enabled ? item.tone : null}>
                            <WantedItemRowImage src={item.imageUrl} size={ITEM_IMAGE_SIZE} />
                        </WantedItemRowTile>
                        <WantedItemRowName>
                            <WantedItemRowTitle>{item.shortName}</WantedItemRowTitle>
                            <WantedItemRowCaption tone={item.tone}>
                                {item.rarityName ?? NO_CATALOG}
                            </WantedItemRowCaption>
                        </WantedItemRowName>
                        <WantedItemRowCell className="w-30">
                            {!item.enabled && <PausedMark />}
                            <WantedItemTags stattrak={item.stattrak} souvenir={item.souvenir} />
                        </WantedItemRowCell>
                        <WantedItemRowCell className="w-35 group-data-[enabled=false]/item:opacity-45">
                            {item.wear && <WearPill>{item.wear}</WearPill>}
                        </WantedItemRowCell>
                        <WantedItemRowCell className="w-42">
                            <WantedItemMax max={item.max}>
                                {item.max.relative && <MaxBadgeNote>vs rec.</MaxBadgeNote>}
                            </WantedItemMax>
                        </WantedItemRowCell>
                        <WantedItemRowCell className="w-18">
                            <WantedItemSwitch name={item.name} enabled={item.enabled} onToggle={onToggle} />
                        </WantedItemRowCell>
                        <ItemActionsMenu itemName={item.name} />
                    </WantedItemRow>
                </li>
            ))}
        </ul>
    );
}
