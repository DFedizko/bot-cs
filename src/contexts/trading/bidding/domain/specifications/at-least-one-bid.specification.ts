import { Specification } from "@/shared/building-blocks/specification";

export class AtLeastOneBidSpecification extends Specification<number> {
    isSatisfiedBy(candidate: number): boolean {
        return candidate > 0;
    }
}
