import { BoundedString } from "@/packages/domain-primitives/bounded-string";

export class ItemName extends BoundedString {
    constructor(value: string) {
        super(value, { min: 2, max: 100, label: "skin name" });
    }
}
