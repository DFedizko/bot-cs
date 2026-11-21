import { HttpServerRouteRecordingDecorator } from "@/packages/infrastructure/http/http-server.route-recording-decorator";
import { HttpServerBunAdapter } from "@/packages/external/http/server/http-server.bun-adapter";
import { HttpMethod } from "@/packages/infrastructure/http/http-method";
import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import { freePort } from "@/packages/external/http/__builders__/free-port.builder";

const FOO_PATH = "/foos/:fooId";
const FOO_DOC: HttpRouteDoc = { summary: "Add a foo", description: "Adds a foo", tags: ["Foos"], responses: [] };
const fooValidator: Validator<unknown> = { validate: (input) => input };
const ROUTE_METHODS = [
    ["get", HttpMethod.GET],
    ["post", HttpMethod.POST],
    ["patch", HttpMethod.PATCH],
    ["put", HttpMethod.PUT],
    ["delete", HttpMethod.DELETE],
] as const;

let inner: HttpServerBunAdapter;
let server: HttpServerRouteRecordingDecorator;

describe("HttpServerRouteRecordingDecorator", () => {
    beforeEach(() => {
        inner = new HttpServerBunAdapter();
        server = new HttpServerRouteRecordingDecorator(inner);
    });

    afterEach(async () => {
        await server.close();
    });

    it.each(ROUTE_METHODS)("Should record a %s route with its input and doc", (name, method) => {
        server[name](FOO_PATH, () => ({}), { input: fooValidator, doc: FOO_DOC });

        const routes = server.routes();

        expect(routes).toEqual([{ method, path: FOO_PATH, input: fooValidator, doc: FOO_DOC }]);
    });

    it("Should record a route registered without options", () => {
        server.get(FOO_PATH, () => ({}));

        const routes = server.routes();

        expect(routes).toEqual([{ method: HttpMethod.GET, path: FOO_PATH }]);
    });

    it("Should serve the route on the decorated server", async () => {
        server.get("/foo", () => ({ body: { served: true } }));
        const port = freePort();
        server.listen(port);

        const response = await fetch(`http://localhost:${port}/foo`);

        expect(await response.json()).toEqual({ served: true });
    });
});
