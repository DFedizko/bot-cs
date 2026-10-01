import { Percentage } from "@/shared/domain-primitives/percentage";
import { DomainError } from "@/shared/error/domain-error";
import { ValueObject } from "@value-object";

export class PercentageWear extends ValueObject<{ percentage: Percentage }> {
    private static readonly MAX_FRACTION = 1;
    private static readonly MAX_PERCENT = 100;

    private constructor(percentage: Percentage) {
        super({ percentage });
    }

    // static fromPercent(percent: string): PercentageWear {
    //     const percentage = Percentage.fromPercent(percent);
    //     PercentageWear.validatePositive(percent);
    //     if (Number(percent) > PercentageWear.MAX_PERCENT)
    //         throw new DomainError({
    //             message: `The percent provided: "${percent}" must be less than ${PercentageWear.MAX_PERCENT}`,
    //         });
    //     return new PercentageWear(percentage);
    // }

    static fromFraction(fraction: string): PercentageWear {
        const percentage = Percentage.fromFraction(fraction);
        PercentageWear.validatePositive(fraction);
        if (Number(fraction) > PercentageWear.MAX_FRACTION)
            throw new DomainError({
                message: `The fraction provided: "${fraction}" must be less than ${PercentageWear.MAX_FRACTION}`,
            });
        return new PercentageWear(percentage);
    }

    getPercentage(): string {
        return this.props.percentage.toPercentString();
    }

    getPercentageString(): string {
        return this.props.percentage.toString();
    }

    getFraction(): string {
        return this.props.percentage.toFractionString();
    }

    private static validatePositive(percentString: string) {
        const percentInNumber = Number(percentString);
        if (percentInNumber < 0)
            throw new DomainError({ message: `The percent provided: "${percentString}" must be positive` });
    }
}
