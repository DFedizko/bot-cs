import { SaleCancellationReason } from "@/contexts/shared-kernel/events/sale-cancellation-reason";

describe("SaleCancellationReason", () => {
    it("Should name every reason a sale offer is cancelled", () => {
        const reasons = Object.values(SaleCancellationReason);

        expect(reasons).toEqual<string[]>([
            "trade_canceled_on_csg",
            "trade_timed_out_on_csg",
            "cancelled_by_unknown_party",
        ]);
    });
});
