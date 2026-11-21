import * as delivery from "@/contexts/delivery";

describe("Delivery barrel", () => {
    it("Should export only the delivery commands and events", () => {
        const exported = Object.keys(delivery).sort();

        expect(exported).toEqual(
            [
                "AcceptDeliveryOfferCommand",
                "CancelTradeOfferCommand",
                "ConfirmTradeOfferCommand",
                "DeliveryCancelledEvent",
                "DeliveryConfirmedEvent",
                "DeliveryDisputedEvent",
                "DeliveryFailedEvent",
                "DeliveryFailureReason",
                "DeliveryOfferNotFoundEvent",
                "DeliveryReceivedEvent",
                "DeliveryStartedEvent",
                "DeliveryStepFailedEvent",
                "DisputeDeliveryCommand",
                "MarkDeliveryReceivedCommand",
                "ScamOffersFoundEvent",
                "StartDeliveryCommand",
                "TradeOfferAcceptedEvent",
                "TradeOfferCancelledEvent",
                "TrackDeliveryCommand",
                "StopDeliveryTrackingCommand",
                "DeliveryTrackingStoppedEvent",
            ].sort(),
        );
    });
});
