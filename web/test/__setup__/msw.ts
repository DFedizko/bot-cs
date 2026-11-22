import { afterAll, afterEach, beforeAll } from "bun:test";
import { mswServer } from "./msw-server";

beforeAll(() => mswServer.listen({ onUnhandledRequest: "error" }));

afterEach(() => mswServer.resetHandlers());

afterAll(() => mswServer.close());
