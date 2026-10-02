import { WearName } from "@/shared-kernel/domain/wear-name";
import { WearNameAcronym } from "@/shared-kernel/domain/wear-name-acronym";
import { ValueObject } from "@/shared/building-blocks/value-object";
import { Decimal } from "@/shared/domain-primitives/decimal";
import { DomainError } from "@/shared/error/domain-error";

const EXACT_FLOAT_DECIMAL_PLACES = 14;

const FLOAT_BREAKDOWN: Record<number, [WearName, WearNameAcronym]> = {
    0.45: [WearName.BATTLE_SCARRED, WearNameAcronym.BS],
    0.38: [WearName.WELL_WORN, WearNameAcronym.WW],
    0.15: [WearName.FIELD_TESTED, WearNameAcronym.FT],
    0.07: [WearName.MINIMAL_WEAR, WearNameAcronym.MW],
    0: [WearName.FACTORY_NEW, WearNameAcronym.FN],
};

export class Float extends ValueObject<{ value: Decimal }> {
    static readonly MAX_DECIMAL_CASES = 20;

    constructor(value: number) {
        if (value >= 1 || value <= 0)
            throw new DomainError({ message: `The float provided: "${value}" must be between 1 and 0` });
        const decimal = new Decimal(value);
        if (decimal.getDecimalPlacesNumber() > Float.MAX_DECIMAL_CASES)
            throw new DomainError({
                message: `The float provided: "${value}" must less than ${Float.MAX_DECIMAL_CASES}`,
            });
        super({ value: decimal });
    }

    getValue(): number {
        return this.props.value.getValue();
    }

    isExact(): boolean {
        const decimalPlaces = this.props.value.getDecimalPlacesNumber();
        return decimalPlaces >= EXACT_FLOAT_DECIMAL_PLACES;
    }

    isApproximate(): boolean {
        const decimalPlaces = this.props.value.getDecimalPlacesNumber();
        return decimalPlaces < EXACT_FLOAT_DECIMAL_PLACES;
    }

    getWear(): WearName {
        return this.getWearAndWearAcronym()[0];
    }

    getWearAcronym(): WearNameAcronym {
        return this.getWearAndWearAcronym()[1];
    }

    private getWearAndWearAcronym(): [WearName, WearNameAcronym] {
        const firstTwoDecimals = this.extractFirstTwoDecimalPlaces();
        return FLOAT_BREAKDOWN[firstTwoDecimals];
    }

    private extractFirstTwoDecimalPlaces(): number {
        const firstTwoDecimalsInString = this.props.value.getDecimalPlaces().slice(0, 2);
        const inDecimal = Number(`0.${firstTwoDecimalsInString}`);
        return inDecimal;
    }
}
