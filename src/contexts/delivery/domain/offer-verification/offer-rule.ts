import { Specification } from "@/packages/building-blocks/specification";
import type { OfferRejectionReason } from "./offer-rejection-reason";
import type { ReceivedOffer } from "./received-offer";

export abstract class OfferRule extends Specification<ReceivedOffer> {
    abstract readonly reason: OfferRejectionReason;
}
