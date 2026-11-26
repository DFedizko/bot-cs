import { ItemTag } from "@/shared/ui/components/item-tag";
import type { WantedItemView } from "../../model/wanted-item-view";

type WantedItemTagsProps = Pick<WantedItemView, "stattrak" | "souvenir">;

export function WantedItemTags({ stattrak, souvenir }: WantedItemTagsProps) {
    return (
        <>
            {stattrak && <ItemTag kind="stattrak">StatTrak™</ItemTag>}
            {souvenir && <ItemTag kind="souvenir">Souvenir</ItemTag>}
        </>
    );
}
