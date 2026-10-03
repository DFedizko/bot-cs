import { DomainError } from "@/shared/error/domain-error";
import { ValueObject } from "@/shared/building-blocks/value-object";
import { randomUUIDv7 } from "bun";

export class UUID extends ValueObject<string> {
    private static readonly REGEX: RegExp =
        /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

    protected constructor(value: string) {
        super(value);
    }

    static create(): UUID {
        return new UUID(randomUUIDv7());
    }

    static restore(value: string): UUID {
        if (!UUID.isValid(value)) {
            throw new DomainError({
                message: `The uuid "${value}" is invalid`,
                code: "INVALID_UUID",
            });
        }

        return new UUID(value);
    }

    static isValid(value: string): boolean {
        return UUID.REGEX.test(value);
    }
}
