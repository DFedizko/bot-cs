import { Specification } from "@/shared/building-blocks/specification";

export class Below50Cent extends Specification<number> {
    isSatisfiedBy(candidate: number): boolean {
        return candidate < 50;
    }
}
