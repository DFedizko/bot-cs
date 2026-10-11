import type { Specification } from "@/shared/building-blocks/specification";

export type DesiredItem = {
    name: string;
    criterias: Specification<unknown>[];
};

export interface DesiredItemRepository {
    findByName(name: string): Promise<DesiredItem | undefined>;
    save(desiredItem: DesiredItem): Promise<void>;
}
