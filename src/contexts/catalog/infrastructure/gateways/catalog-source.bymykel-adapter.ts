import { Rarity } from "@/contexts/shared-kernel/domain/rarity";
import type { Logger } from "@/packages/application/logger";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import type { CatalogRow, CatalogSource } from "../sources/catalog.source";
import type { ByMykelSkinsHttp } from "../http/bymykel/bymykel-skins.http";
import type { ByMykelRarityId } from "../http/bymykel/types/bymykel-skin";
import type { ByMykelCatalogEntry } from "../http/bymykel/types/bymykel-catalog-entry";

const RARITY_BY_SOURCE_ID: Record<ByMykelRarityId, Rarity> = {
    rarity_common_weapon: Rarity.CONSUMER_GRADE,
    rarity_uncommon_weapon: Rarity.INDUSTRIAL_GRADE,
    rarity_rare_weapon: Rarity.MIL_SPEC_GRADE,
    rarity_mythical_weapon: Rarity.RESTRICTED,
    rarity_legendary_weapon: Rarity.CLASSIFIED,
    rarity_ancient_weapon: Rarity.COVERT,
    rarity_ancient: Rarity.EXTRAORDINARY,
    rarity_contraband_weapon: Rarity.CONTRABAND,
};

const NONE = 0;

export class CatalogSourceByMykelAdapter implements CatalogSource {
    constructor(
        private readonly http: ByMykelSkinsHttp,
        private readonly validator: Validator<ByMykelCatalogEntry>,
        private readonly logger: Logger,
    ) {}

    async load(): Promise<CatalogRow[]> {
        const skins: readonly unknown[] = await this.http.getSkinsNotGrouped();
        const accepted = skins.map((skin) => this.parseEntry(skin)).filter((entry) => entry !== undefined);
        this.warnAboutRejected(skins.length - accepted.length);
        return this.keepFirstOfEachName(accepted.map((entry) => this.mapToRow(entry)));
    }

    private parseEntry(skin: unknown): ByMykelCatalogEntry | undefined {
        try {
            return this.validator.validate(skin);
        } catch {
            return undefined;
        }
    }

    private warnAboutRejected(rejected: number): void {
        if (rejected > NONE)
            this.logger.log(`Warning: the catalog source has ${rejected} entries the contract rejects`);
    }

    private keepFirstOfEachName(rows: CatalogRow[]): CatalogRow[] {
        const byName = new Map<string, CatalogRow>();
        rows.forEach((row) => this.keepIfFirst(byName, row));
        return [...byName.values()];
    }

    private keepIfFirst(byName: Map<string, CatalogRow>, row: CatalogRow): void {
        if (!byName.has(row.marketHashName)) byName.set(row.marketHashName, row);
    }

    private mapToRow(entry: ByMykelCatalogEntry): CatalogRow {
        return {
            marketHashName: entry.market_hash_name,
            weapon: entry.weapon.name,
            skin: entry.pattern?.name ?? null,
            wear: entry.wear?.name ?? null,
            stattrak: entry.stattrak,
            souvenir: entry.souvenir ?? false,
            category: entry.category.name,
            rarity: RARITY_BY_SOURCE_ID[entry.rarity.id],
            imageUrl: entry.image,
        };
    }
}
