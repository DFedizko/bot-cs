import type { StoreFactory } from "@/shared/lib/store/store-factory";
import { createMemoryStore } from "./create-memory-store";

export const createMemoryStoreFactory = (): StoreFactory => createMemoryStore;
