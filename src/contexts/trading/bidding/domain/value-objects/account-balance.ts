import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";
import { ValueObject } from "@/shared/building-blocks/value-object";
import { Money } from "@/shared/domain-primitives/money";

export class AccountBalance extends ValueObject<{ total: Money; reserved: Money; available: Money }> {
    constructor({ total, reserved, available }: { total: number; reserved: number; available: number }) {
        super({ total: CoinCent(total), reserved: CoinCent(reserved), available: CoinCent(available) });
    }

    covers(value: number): boolean {
        return this.value.available.isGreaterThan(CoinCent(value)) || this.value.available.equals(CoinCent(value));
    }

    getTotal(): number {
        return this.value.total.getAmount();
    }

    getReserved(): number {
        return this.value.reserved.getAmount();
    }

    getAvailable(): number {
        return this.value.available.getAmount();
    }
}
