import { Specification } from "@/packages/building-blocks/specification";

export class Below50Cent extends Specification<number> {
    isSatisfiedBy(candidate: number): boolean {
        return candidate < 50;
    }
}
