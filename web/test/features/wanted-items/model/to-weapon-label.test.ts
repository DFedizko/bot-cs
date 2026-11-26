import { describe, expect, it } from "bun:test";
import { toWeaponLabel } from "@/features/wanted-items/model/to-weapon-label";

describe("toWeaponLabel", () => {
    it("Should mark a knife with the star its market name starts with", () => {
        expect(toWeaponLabel("★ Karambit | Doppler (Factory New)", "Karambit")).toBe("★ Karambit");
    });

    it("Should show any other weapon as it is", () => {
        expect(toWeaponLabel("AWP | Asiimov (Field-Tested)", "AWP")).toBe("AWP");
    });
});
