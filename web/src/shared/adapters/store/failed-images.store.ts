import { create } from "zustand";
import type { FailedImagesState } from "@/shared/lib/store/failed-images.store";

const rememberOnce = (failedImages: ReadonlyArray<string>, imageUrl: string) =>
    failedImages.includes(imageUrl) ? failedImages : [...failedImages, imageUrl];

export const useFailedImagesStore = create<FailedImagesState>()((set) => ({
    failedImages: [],
    markImageFailed: (imageUrl) => set(({ failedImages }) => ({ failedImages: rememberOnce(failedImages, imageUrl) })),
}));
