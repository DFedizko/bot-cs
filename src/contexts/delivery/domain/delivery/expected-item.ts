import { ValueObject } from "@/packages/building-blocks/value-object";
import { AppId } from "./app-id";
import { AssetId } from "./asset-id";
import { MarketHashName } from "@/contexts/shared-kernel/domain/market-hash-name";

export type ExpectedItemProps = { assetId: string; marketName: string; appId: number };

type ExpectedItemValue = { assetId: AssetId; marketName: MarketHashName; appId: AppId };

export class ExpectedItem extends ValueObject<ExpectedItemValue> {
    static create(props: ExpectedItemProps): ExpectedItem {
        return new ExpectedItem({
            assetId: new AssetId(props.assetId),
            marketName: new MarketHashName(props.marketName),
            appId: new AppId(props.appId),
        });
    }

    isSameAsset(assetId: string, appId: number): boolean {
        return this.value.assetId.getValue() === assetId && this.value.appId.getValue() === appId;
    }

    toPrimitives(): ExpectedItemProps {
        return {
            assetId: this.value.assetId.getValue(),
            marketName: this.value.marketName.getValue(),
            appId: this.value.appId.getValue(),
        };
    }
}
