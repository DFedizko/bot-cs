import type { WantedSkinRepository } from "../../application/repositories/wanted-skin.repository";
import { WantedSkin } from "../../domain/wanted-skin/wanted-skin";

export class WantedSkinRepositoryInMemory implements WantedSkinRepository {
    private readonly store = new Map<string, WantedSkin>();

    async findByName(name: string): Promise<WantedSkin | undefined> {
        return this.store.get(name);
    }

    async save(desiredSkin: WantedSkin): Promise<void> {
        this.store.set(desiredSkin.getName(), desiredSkin);
    }
}
