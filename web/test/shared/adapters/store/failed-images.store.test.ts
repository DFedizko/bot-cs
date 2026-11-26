import { describe, expect, it } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useFailedImagesStore } from "@/shared/adapters/store/failed-images.store";

const BROKEN_IMAGE = "https://community.akamai.steamstatic.com/economy/image/broken/256fx256f";

const renderStore = () =>
    renderHook(() => ({
        failedImages: useFailedImagesStore((state) => state.failedImages),
        markImageFailed: useFailedImagesStore((state) => state.markImageFailed),
    }));

describe("useFailedImagesStore", () => {
    it("Should start with no failed image", () => {
        const { result } = renderStore();

        expect(result.current.failedImages).toEqual([]);
    });

    it("Should remember an image that failed to load", () => {
        const { result } = renderStore();

        act(() => result.current.markImageFailed(BROKEN_IMAGE));

        expect(result.current.failedImages).toEqual([BROKEN_IMAGE]);
    });

    it("Should remember a failed image once", () => {
        const { result } = renderStore();

        act(() => {
            result.current.markImageFailed(BROKEN_IMAGE);
            result.current.markImageFailed(BROKEN_IMAGE);
        });

        expect(result.current.failedImages).toEqual([BROKEN_IMAGE]);
    });
});
