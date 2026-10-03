import { DomainError } from "@/shared/error/domain-error";
import { ValueObject } from "../building-blocks/value-object";

type CurrencyProps = {
    code: string;
    decimals: number;
    locale: Intl.LocalesArgument;
    isOfficial: boolean;
};

type CreateCurrencyProps = {
    code: string;
    decimals: number;
    locale?: Intl.LocalesArgument;
};

enum ERROR_CODE {
    INVALID_DECIMAL = "INVALID_DECIMAL",
    INVALID_CODE = "INVALID_CODE",
}

export class Currency extends ValueObject<CurrencyProps> {
    private static readonly MAX_DECIMALS = 10;
    private static readonly MAX_CODE_CHARACTERS = 10;

    private constructor(value: CurrencyProps) {
        super(value);
    }

    static create({ code, decimals, locale = "en-US" }: CreateCurrencyProps): Currency {
        const cleannedCode = code.trim().toLocaleUpperCase();
        Currency.validateCode(cleannedCode);
        Currency.validateDecimals(decimals);
        return new Currency({
            code: cleannedCode,
            decimals,
            locale,
            isOfficial: Currency.isOfficialCode(cleannedCode),
        });
    }

    format(decimalAmount: number): string {
        if (this.value.isOfficial) {
            return new Intl.NumberFormat(this.value.locale, {
                style: "currency",
                currency: this.value.code,
                minimumFractionDigits: this.value.decimals,
            }).format(decimalAmount);
        }
        const formattedNumber = new Intl.NumberFormat(this.value.locale, {
            style: "decimal",
            minimumFractionDigits: this.value.decimals,
        }).format(decimalAmount);
        return `${formattedNumber} ${this.value.code}`;
    }

    getCode(): string {
        return this.value.code;
    }

    getDecimals(): number {
        return this.value.decimals;
    }

    getLocale(): Intl.LocalesArgument {
        return this.value.locale;
    }

    private static validateCode(code: string): void {
        if (code.length === 0) {
            throw new DomainError({
                message: `The code: "${code}" must have at least 1 character`,
                code: ERROR_CODE.INVALID_CODE,
            });
        }
        if (code.length > Currency.MAX_CODE_CHARACTERS) {
            throw new DomainError({
                message: `The code: "${code}" must be less then ${this.MAX_CODE_CHARACTERS} characters`,
                code: ERROR_CODE.INVALID_CODE,
            });
        }
        if (!isNaN(Number(code))) {
            throw new DomainError({
                message: `The code: "${code}" cannot be a number in string format`,
                code: ERROR_CODE.INVALID_CODE,
            });
        }
    }

    private static validateDecimals(decimals: number): void {
        if (decimals > Currency.MAX_DECIMALS) {
            throw new DomainError({
                message: `Invalid decimal: "${decimals}", max allowed is ${this.MAX_DECIMALS}`,
                code: ERROR_CODE.INVALID_DECIMAL,
            });
        }
        if (!Number.isInteger(decimals)) {
            throw new DomainError({
                message: `Invalid decimal: "${decimals}", the quantity of decimals must be a integer number`,
                code: ERROR_CODE.INVALID_DECIMAL,
            });
        }
    }

    private static isOfficialCode(code: string): boolean {
        try {
            new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: code,
            });
            return true;
        } catch {
            return false;
        }
    }
}
