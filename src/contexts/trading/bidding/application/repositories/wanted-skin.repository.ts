import type { WantedSkin } from "../../domain/wanted-skin/wanted-skin";

export interface WantedSkinRepository {
    findByName(name: string): Promise<WantedSkin | undefined>;
    save(desiredSkin: WantedSkin): Promise<void>;
}
