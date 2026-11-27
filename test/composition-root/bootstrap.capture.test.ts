import type { Container } from "inversify";
import { Bootstrap } from "@/composition-root/bootstrap";
import { testContainer } from "@/__builders__/test-container.builder";
import { HTTP_SERVER, LOGGER } from "@/packages/external/di/packages.identifiers";
import { CSG_WS_CLIENT } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";

const CAPTURED_EVENTS = ["trade_status", "deposit_failed", "auction_update", "deleted_item"];
const PRODUCTION_LISTENERS = { trade_status: 1, deposit_failed: 0, auction_update: 0, deleted_item: 0 };

const listenedEvents = async (nodeEnv: AppEnv["NODE_ENV"]): Promise<string[]> => {
    container = testContainer(nodeEnv);
    jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    const wsOnSpy = jest.spyOn(await container.getAsync(CSG_WS_CLIENT), "on");
    await new Bootstrap(container).run();
    return wsOnSpy.mock.calls.map(([event]) => event);
};

const countListeners = (events: string[]): Record<string, number> =>
    Object.fromEntries(CAPTURED_EVENTS.map((event) => [event, events.filter((name) => name === event).length]));

let container: Container;

describe("Bootstrap raw CSG capture", () => {
    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    it("Should capture the raw deposit events in development", async () => {
        const events = await listenedEvents("development");

        expect(events).toEqual(expect.arrayContaining(CAPTURED_EVENTS));
    });

    it("Should not capture anything in production", async () => {
        const events = await listenedEvents("production");

        expect(countListeners(events)).toEqual(PRODUCTION_LISTENERS);
    });
});
