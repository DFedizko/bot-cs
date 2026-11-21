import type { Container } from "inversify";
import { Bootstrap } from "@/composition-root/bootstrap";
import { testContainer } from "@/__builders__/test-container.builder";
import { ENV, HTTP_SERVER, LOGGER } from "@/packages/external/di/packages.identifiers";

const DOCS_ENVIRONMENTS: AppEnv["NODE_ENV"][] = ["development", "test"];
const NO_DOCS_ENVIRONMENT = "production";
const DOCS_LOG = /^Docs available at: /;

const docsLog = (port: number): string => `Docs available at: http://localhost:${port}/docs`;

let container: Container;

describe("Bootstrap api docs", () => {
    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    describe.each(DOCS_ENVIRONMENTS)("in %s", (nodeEnv) => {
        beforeEach(() => {
            container = testContainer(nodeEnv);
        });

        it("Should log where the api docs are served, on the configured port", async () => {
            const logSpy = jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

            await new Bootstrap(container).run();

            expect(logSpy).toHaveBeenCalledWith(docsLog(container.get(ENV).HTTP_PORT));
        });

        it("Should log the api docs after the http server listens", async () => {
            const logSpy = jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
            const listenSpy = jest.spyOn(container.get(HTTP_SERVER), "listen");

            await new Bootstrap(container).run();

            const docsCall = logSpy.mock.calls.findIndex(([message]) => DOCS_LOG.test(message));
            expect(listenSpy.mock.invocationCallOrder[0]).toBeLessThan(logSpy.mock.invocationCallOrder[docsCall]!);
        });
    });

    describe(`in ${NO_DOCS_ENVIRONMENT}`, () => {
        beforeEach(() => {
            container = testContainer(NO_DOCS_ENVIRONMENT);
        });

        it("Should not log api docs it doesn't serve", async () => {
            const logSpy = jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

            await new Bootstrap(container).run();

            expect(logSpy.mock.calls.filter(([message]) => DOCS_LOG.test(message))).toEqual([]);
        });
    });
});
