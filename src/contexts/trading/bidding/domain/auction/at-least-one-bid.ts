import { Specification } from "@/shared/building-blocks/specification";

export class AtLeastOneBid extends Specification<number> {
    isSatisfiedBy(candidate: number): boolean {
        return candidate > 0;
    }
}
