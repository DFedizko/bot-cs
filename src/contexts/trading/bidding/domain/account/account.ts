import { AggregateRoot } from "@/packages/building-blocks/aggregate-root";
import { AccountId } from "./account-id";
import { NumericLiteral } from "typescript/unstable/ast";

type CreateProps = {
    id: number;
};

export class Account extends AggregateRoot<AccountId> {
    private constructor(id: number) {
        super(new AccountId(id));
    }

    static create(props: CreateProps): Account {
        return new Account(props.id);
    }

    isMe(bidderId: number): boolean {
        return this.id.getValue() === bidderId;
    }

    getId(): number {
        return this.id.getValue();
    }
}
