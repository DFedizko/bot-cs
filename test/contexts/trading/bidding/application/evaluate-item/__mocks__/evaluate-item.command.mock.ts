import { EvaluateItemCommand } from "@/contexts/trading/bidding/application/evaluate-item/evaluate-item.command";

export const evaluateItemCommand = (inAuction = true) =>
    new EvaluateItemCommand({
        id: 288767047,
        itemName: "M4A4 | Cyber Security (Field-Tested)",
        price: 3656,
        referencePrice: 3801,
        numberOfBids: 0,
        aboveRecommendedPercentage: "-4.05",
        inAuction,
    });
