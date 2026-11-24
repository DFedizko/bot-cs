import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { IsWear } from "@/contexts/trading/bidding/domain/wanted-item/criteria/is-wear";
import { bidCandidate } from "../__builders__/bid-candidate.builder";
import { DomainError } from "@/packages/error/domain-error";

test("Should return true when the candidate has the desired wear", () => {
    expect(new IsWear(WearName.BATTLE_SCARRED).isSatisfiedBy(bidCandidate({ wearName: WearName.BATTLE_SCARRED }))).toBe(
        true,
    );
    expect(new IsWear(WearName.WELL_WORN).isSatisfiedBy(bidCandidate({ wearName: WearName.WELL_WORN }))).toBe(true);
    expect(new IsWear(WearName.FIELD_TESTED).isSatisfiedBy(bidCandidate({ wearName: WearName.FIELD_TESTED }))).toBe(
        true,
    );
    expect(new IsWear(WearName.MINIMAL_WEAR).isSatisfiedBy(bidCandidate({ wearName: WearName.MINIMAL_WEAR }))).toBe(
        true,
    );
    expect(new IsWear(WearName.FACTORY_NEW).isSatisfiedBy(bidCandidate({ wearName: WearName.FACTORY_NEW }))).toBe(true);
});
test("Should return false when the candidate hasn't the desired wear", () => {
    expect(new IsWear(WearName.FACTORY_NEW).isSatisfiedBy(bidCandidate({ wearName: WearName.BATTLE_SCARRED }))).toBe(
        false,
    );
    expect(new IsWear(WearName.MINIMAL_WEAR).isSatisfiedBy(bidCandidate({ wearName: WearName.WELL_WORN }))).toBe(false);
    expect(new IsWear(WearName.FIELD_TESTED).isSatisfiedBy(bidCandidate({ wearName: WearName.BATTLE_SCARRED }))).toBe(
        false,
    );
    expect(new IsWear(WearName.WELL_WORN).isSatisfiedBy(bidCandidate({ wearName: WearName.MINIMAL_WEAR }))).toBe(false);
    expect(new IsWear(WearName.BATTLE_SCARRED).isSatisfiedBy(bidCandidate({ wearName: WearName.FACTORY_NEW }))).toBe(
        false,
    );
});
test("Should throw an error when create a IsWear criterion with an invalid wear", () =>
    expect(() => new IsWear("Field Tested")).toThrow(DomainError));
test("Should give back the primitives it was built from", () => {
    expect(new IsWear(WearName.FIELD_TESTED).toPrimitives()).toEqual({ type: "IsWear", value: WearName.FIELD_TESTED });
});
