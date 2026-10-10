import { Specification } from "@/shared/building-blocks/specification";

export class Below50CentSpecification extends Specification<number> {
    isSatisfiedBy(candidate: number): boolean {
        return candidate < 50;
    }
}
