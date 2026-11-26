import { describe, expect, it } from "bun:test";
import { describeMax } from "@/features/wanted-items/model/describe-max";

describe("describeMax", () => {
    it("Should show a max below the recommended price as a green negative percentage", () => {
        expect(describeMax({ type: "percentage", value: -3 })).toEqual({ tone: "below", value: "−3%", relative: true });
    });

    it("Should show a max above the recommended price as an amber positive percentage", () => {
        expect(describeMax({ type: "percentage", value: 2 })).toEqual({ tone: "above", value: "+2%", relative: true });
    });

    it("Should show a max at the recommended price as a neutral zero", () => {
        expect(describeMax({ type: "percentage", value: 0 })).toEqual({ tone: "even", value: "0%", relative: true });
    });

    it("Should show a fixed max in coins", () => {
        expect(describeMax({ type: "value", value: 4250 })).toEqual({ tone: "even", value: "42.50", relative: false });
    });
});
