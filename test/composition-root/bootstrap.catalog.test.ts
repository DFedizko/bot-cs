import type { Container } from "inversify";
import { Bootstrap } from "@/composition-root/bootstrap";
import { testContainer } from "@/__builders__/test-container.builder";
import { HTTP_SERVER, LOGGER } from "@/packages/external/di/packages.identifiers";
import { CATALOG_SOURCE } from "@/contexts/catalog/external/di/catalog.identifiers";

const DRY_RUN_ENV = "development";
const SOURCE_DOWN = new Error("The catalog source is down");
const neverAnswers = () => new Promise<never>(() => {});

let container: Container;

describe("Bootstrap catalog", () => {
    beforeEach(() => {
        container = testContainer(DRY_RUN_ENV);
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    it("Should start loading the catalog", async () => {
        const loadSpy = jest.spyOn(container.get(CATALOG_SOURCE), "load");

        await new Bootstrap(container).run();

        expect(loadSpy).toHaveBeenCalledTimes(1);
    });

    it("Should start the bot without waiting for the catalog", async () => {
        jest.spyOn(container.get(CATALOG_SOURCE), "load").mockImplementation(neverAnswers);

        const running = new Bootstrap(container).run();

        await expect(running).resolves.toBeUndefined();
    });

    it("Should start the bot when the catalog fails to load", async () => {
        jest.spyOn(container.get(CATALOG_SOURCE), "load").mockRejectedValue(SOURCE_DOWN);

        const running = new Bootstrap(container).run();

        await expect(running).resolves.toBeUndefined();
    });
});
