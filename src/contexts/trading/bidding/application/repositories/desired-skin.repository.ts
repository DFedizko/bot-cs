import type { Specification } from "@/shared/building-blocks/specification";
import type { WantedSkin } from "../../domain/wanted-skin/wanted-skin";

export interface DesiredSkinRepository {
    findByName(name: string): Promise<WantedSkin | undefined>;
    save(desiredSkin: WantedSkin): Promise<void>;
}
