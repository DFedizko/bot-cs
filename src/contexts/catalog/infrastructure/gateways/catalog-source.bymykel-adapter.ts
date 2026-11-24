import type { Logger } from "@/packages/application/logger";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import type { CatalogSource } from "../../application/load-catalog/catalog.source";
import { CatalogItem } from "../../domain/catalog-item/catalog-item";
import { Rarity } from "../../domain/catalog-item/rarity";
import type { ByMykelSkinsHttp } from "../http/bymykel/bymykel-skins.http";
import type { ByMykelRarityId } from "../http/bymykel/types/bymykel-skin";
import type { ByMykelCatalogEntry } from "../http/bymykel/types/bymykel-catalog-entry";

const RARITY_BY_SOURCE_ID: Record<ByMykelRarityId, Rarity> = {
    rarity_common_weapon: Rarity.CONSUMER,
    rarity_uncommon_weapon: Rarity.INDUSTRIAL,
    rarity_rare_weapon: Rarity.MILSPEC,
    rarity_mythical_weapon: Rarity.RESTRICTED,
    rarity_legendary_weapon: Rarity.CLASSIFIED,
    rarity_ancient_weapon: Rarity.COVERT,
    rarity_ancient: Rarity.EXTRAORDINARY,
    rarity_contraband_weapon: Rarity.CONTRABAND,
};

export class CatalogSourceByMykelAdapter implements CatalogSource {
    constructor(
        private readonly http: ByMykelSkinsHttp,
        private readonly validator: Validator<ByMykelCatalogEntry>,
        private readonly logger: Logger,
    ) {}

    async load(): Promise<CatalogItem[]> {
        const skins: readonly unknown[] = await this.http.getSkinsNotGrouped();
        const entries = skins.map((skin) => this.parseEntry(skin));
        const accepted = entries.filter((entry) => entry !== undefined);
        this.warnAboutRejected(skins.length - accepted.length);
        return accepted.map((entry) => this.mapToItem(entry));
    }

    private parseEntry(skin: unknown): ByMykelCatalogEntry | undefined {
        try {
            return this.validator.validate(skin);
        } catch {
            return undefined;
        }
    }

    private warnAboutRejected(rejected: number): void {
        if (rejected > 0) this.logger.log(`Warning: the catalog source has ${rejected} entries the contract rejects`);
    }

    private mapToItem(entry: ByMykelCatalogEntry): CatalogItem {
        return CatalogItem.create({
            marketHashName: entry.market_hash_name,
            weapon: entry.weapon.name,
            skin: entry.pattern?.name ?? null,
            wear: entry.wear?.name ?? null,
            stattrak: entry.stattrak,
            souvenir: entry.souvenir ?? false,
            category: entry.category.name,
            rarity: RARITY_BY_SOURCE_ID[entry.rarity.id],
            imageUrl: entry.image,
        });
    }
}
