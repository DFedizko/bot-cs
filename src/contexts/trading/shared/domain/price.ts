import { AboveRecommendedPercentage } from "@/contexts/trading/shared/domain/above-recommended-percentage";
import { MarketPrice } from "@/contexts/trading/shared/domain/market-price";
import { SuggestedPrice } from "@/contexts/trading/shared/domain/suggested-price";
import { COIN } from "@/shared-kernel/domain/coin";
import { ValueObject } from "@/shared/building-blocks/value-object";
import { Currency } from "@/shared/domain-primitives/currency";

type CreatePriceProps = {
    currency?: Currency;
    marketPriceInCents: number;
    suggestedPriceInCents: number;
    aboveRecommendedFractionPercentage: string;
};

export class Price extends ValueObject<{
    currency: Currency;
    marketPrice: MarketPrice;
    suggestedPrice: SuggestedPrice;
    aboveRecommendedPercentage: AboveRecommendedPercentage;
}> {
    private constructor(props: CreatePriceProps) {
        const currency = props?.currency ?? COIN;
        super({ 
            aboveRecommendedPercentage: AboveRecommendedPercentage.fromFraction(
                props.aboveRecommendedFractionPercentage,
            ),
            marketPrice: MarketPrice.fromCents({ amount: props.marketPriceInCents, currency }),
            suggestedPrice: SuggestedPrice.fromCents({ amount: props.suggestedPriceInCents, currency }),
            currency,
        });
    }

    static create({
        aboveRecommendedFractionPercentage,
        marketPriceInCents,
        suggestedPriceInCents,
        currency,
    }: CreatePriceProps): Price {
        return new Price({ aboveRecommendedFractionPercentage, marketPriceInCents, suggestedPriceInCents, currency });
    }

    getMarketPrice(): bigint {
        return this.value.marketPrice.getAmount();
    }

    getSuggestedPrice(): bigint {
        return this.value.suggestedPrice.getAmount();
    }

    getAboveRecommendedPercentage(): string {
        return this.value.aboveRecommendedPercentage.toFractionString();
    }

    getCurrency(): string {
        return this.value.currency.getCode();
    }
}
