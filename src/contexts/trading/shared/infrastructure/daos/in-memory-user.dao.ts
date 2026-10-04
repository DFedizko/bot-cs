import { NotFoundError } from "@/shared/error/not-found.error";
import { UserDao } from "../../application/daos/user.dao";

export class InMemoryUserDao implements UserDao {
    private readonly store = new Map<string, { balance: number }>().set("1", { balance: 100000 });

    async getUserBalanceById(id: string): Promise<number> {
        const user = this.store.get(id);
        if (!user) {
            throw new NotFoundError(`User not found by the id "${id}"`);
        }
        return user.balance;
    }
}
