import { WearPill } from "@/shared/ui/components/wear-pill";
import type { WantedItemView } from "../../model/wanted-item-view";
import { ITEM_IMAGE_SIZE } from "./item-image-size";
import { ItemActionsMenu } from "./item-actions-menu";
import { PausedMark } from "./paused-mark";
import {
    WantedItemCard,
    WantedItemCardBody,
    WantedItemCardFooter,
    WantedItemCardImage,
    WantedItemCardMedia,
    WantedItemCardMeta,
    WantedItemCardRarity,
    WantedItemCardRarityDot,
    WantedItemCardRarityName,
    WantedItemCardTags,
    WantedItemCardTitle,
} from "./wanted-item-card";
import { WantedItemMax } from "./wanted-item-max";
import { WantedItemSwitch } from "./wanted-item-switch";
import { WantedItemTags } from "./wanted-item-tags";

const NO_CATALOG = "No catalog data";

type WantedItemsGridProps = { items: Array<WantedItemView>; onToggle: (name: string, enabled: boolean) => void };

export function WantedItemsGrid({ items, onToggle }: WantedItemsGridProps) {
    return (
        <ul aria-label="Wanted items" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {items.map((item) => (
                <li key={item.name} className="min-w-0">
                    <WantedItemCard name={item.name} enabled={item.enabled}>
                        <WantedItemCardMedia tone={item.enabled ? item.tone : null}>
                            <WantedItemCardImage src={item.imageUrl} size={ITEM_IMAGE_SIZE} />
                            <WantedItemCardTags>
                                <WantedItemTags stattrak={item.stattrak} souvenir={item.souvenir} />
                            </WantedItemCardTags>
                            <ItemActionsMenu itemName={item.name} className="absolute top-1 right-1" />
                            {!item.enabled && <PausedMark className="absolute bottom-2 left-2" />}
                        </WantedItemCardMedia>
                        <WantedItemCardBody>
                            <WantedItemCardRarity>
                                {item.tone && <WantedItemCardRarityDot tone={item.tone} />}
                                {item.tone && (
                                    <WantedItemCardRarityName tone={item.tone}>
                                        {item.rarityName}
                                    </WantedItemCardRarityName>
                                )}
                                {item.weapon ? <span className="truncate">· {item.weapon}</span> : NO_CATALOG}
                            </WantedItemCardRarity>
                            <WantedItemCardTitle title={item.title}>{item.title}</WantedItemCardTitle>
                            <WantedItemCardMeta>{item.wear && <WearPill>{item.wear}</WearPill>}</WantedItemCardMeta>
                            <WantedItemCardFooter>
                                <WantedItemMax max={item.max} />
                                <WantedItemSwitch name={item.name} enabled={item.enabled} onToggle={onToggle} />
                            </WantedItemCardFooter>
                        </WantedItemCardBody>
                    </WantedItemCard>
                </li>
            ))}
        </ul>
    );
}
