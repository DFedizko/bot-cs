import type { Specification } from "@/shared/building-blocks/specification";

export type DesiredSkin = {
    name: string;
    criterias: Specification<unknown>[];
};

export interface DesiredSkinRepository {
    findByName(name: string): Promise<DesiredSkin | undefined>;
    save(desiredSkin: DesiredSkin): Promise<void>;
}
