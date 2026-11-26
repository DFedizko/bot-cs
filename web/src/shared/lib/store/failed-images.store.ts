import { definePort } from "../define-port";

const FAILED_IMAGES_STORE_PORT = "FailedImagesStore";

export type FailedImagesState = {
    failedImages: ReadonlyArray<string>;
    markImageFailed: (imageUrl: string) => void;
};

export type UseFailedImagesStore = <TValue>(selector: (state: FailedImagesState) => TValue) => TValue;

const { Provider, usePort } = definePort<UseFailedImagesStore>(FAILED_IMAGES_STORE_PORT);

export const FailedImagesStoreProvider = Provider;

export const useFailedImagesStore: UseFailedImagesStore = (selector) => usePort()(selector);
