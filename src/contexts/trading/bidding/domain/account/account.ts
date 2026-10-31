import { AggregateRoot } from "@/packages/building-blocks/aggregate-root";
import { AccountId } from "./account-id";
import { AccountBalance } from "./account-balance";
import { Reservations, type ReservationsPrimitives } from "./reservations";
import { InsufficientBalanceError } from "./errors/insufficient-balance.error";
import { FluentAccountBalance } from "../value-objects/fluent-account-balance";
import { ReservationId } from "./reservation-id";
import { AccountName } from "./account-name";

type CreateProps = {
    id: number;
    name: string;
    totalAmount?: number;
    reservations?: ReservationsPrimitives;
};

export class Account extends AggregateRoot<AccountId> {
    private constructor(
        id: number,
        private readonly name: AccountName,
        private accountBalance: AccountBalance,
        private reservations: Reservations,
    ) {
        super(new AccountId(id));
        this.verifySufficientBalance(reservations.getTotalReserved(), accountBalance.getTotal());
    }

    static sync(props: CreateProps): Account {
        const reservations = props?.reservations ? Reservations.create(props.reservations) : Reservations.empty();
        return new Account(
            props.id,
            new AccountName(props.name),
            new AccountBalance({ total: props?.totalAmount ?? 0, reserved: reservations.getTotalReserved() }),
            reservations,
        );
    }

    reserveFor(reservationId: number, amount: number): void {
        this.verifySufficientBalance(amount, this.accountBalance.getAvailable());
        this.reservations = this.reservations.reserveFor(reservationId, amount);
        this.accountBalance = new FluentAccountBalance(this.accountBalance)
            .incrementReserved(amount)
            .decrementAvailable(amount)
            .getBalance();
    }

    refundFor(reservationId: number): void {
        const refundAmount = this.reservations.amountFor(reservationId);
        this.reservations = this.reservations.refundFor(reservationId);
        this.accountBalance = new FluentAccountBalance(this.accountBalance)
            .decrementReserved(refundAmount)
            .incrementAvailable(refundAmount)
            .getBalance();
    }

    credit(amount: number): void {
        this.accountBalance = new FluentAccountBalance(this.accountBalance)
            .incrementTotal(amount)
            .incrementAvailable(amount)
            .getBalance();
    }

    debitFor(reservationId: number): void {
        const amount = this.reservations.amountFor(reservationId);
        this.reservations = this.reservations.refundFor(reservationId);
        this.accountBalance = new FluentAccountBalance(this.accountBalance)
            .decrementTotal(amount)
            .decrementReserved(amount)
            .getBalance();
    }

    hasReservationFor(reservationId: number): boolean {
        return Boolean(this.reservations.amountFor(new ReservationId(reservationId).getValue()));
    }

    covers(value: number): boolean {
        return this.accountBalance.covers(value);
    }

    isMe(bidderId: number): boolean {
        return this.id.getValue() === bidderId;
    }

    getId(): number {
        return this.id.getValue();
    }

    getName(): string {
        return this.name.getValue();
    }

    getTotalAmount(): number {
        return this.accountBalance.getTotal();
    }

    getReservedAmount(): number {
        return this.accountBalance.getReserved();
    }

    getAvailableAmount(): number {
        return this.accountBalance.getAvailable();
    }

    private verifySufficientBalance(amount: number, availableAmount: number): void {
        if (amount > availableAmount) throw new InsufficientBalanceError(amount);
    }
}
