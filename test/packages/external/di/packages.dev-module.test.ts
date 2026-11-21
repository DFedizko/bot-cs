import { Container } from "inversify";
import { PackagesModule } from "@/packages/external/di/packages.module";
import { PackagesDevModule } from "@/packages/external/di/packages.dev-module";
import {
    API_DOCUMENT,
    API_DOCUMENT_CONTROLLER,
    API_REFERENCE_CONTROLLER,
    API_REFERENCE_PAGE,
    HTTP_CONTROLLER,
    HTTP_ROUTE_DOC,
} from "@/packages/external/di/packages.identifiers";
import { ApiDocumentZodAdapter } from "@/packages/external/openapi/api-document.zod-adapter";
import { ApiReferenceScalarAdapter } from "@/packages/external/openapi/api-reference.scalar-adapter";
import { ApiDocumentHttpController } from "@/packages/infrastructure/http/docs/api-document.http-controller";
import { ApiReferenceHttpController } from "@/packages/infrastructure/http/docs/api-reference.http-controller";
import { addFooRoute } from "@/packages/external/openapi/__stubs__/foo.route-doc";

const ENV = { NODE_ENV: "development", CSGOEMPIRE_API_KEY: "api-key", HTTP_PORT: 0 } as const;
const FOO_PATH = "/foos/{fooId}";
const DOCS_CONTROLLERS = [
    { identifier: API_DOCUMENT_CONTROLLER, implementation: ApiDocumentHttpController },
    { identifier: API_REFERENCE_CONTROLLER, implementation: ApiReferenceHttpController },
];

let container: Container;

describe("PackagesDevModule", () => {
    beforeEach(() => {
        container = new Container();
        container.load(new PackagesModule(ENV), new PackagesDevModule());
    });

    it("Should bind the zod api document", () => {
        const apiDocument = container.get(API_DOCUMENT);

        expect(apiDocument).toBeInstanceOf(ApiDocumentZodAdapter);
    });

    it("Should document every bound route", () => {
        container.bind(HTTP_ROUTE_DOC).toConstantValue(addFooRoute);

        const document = container.get(API_DOCUMENT).toJson();

        expect(Object.keys(document.paths as object)).toEqual([FOO_PATH]);
    });

    it("Should bind an empty api document when no route is documented", () => {
        const document = container.get(API_DOCUMENT).toJson();

        expect(document.paths).toEqual({});
    });

    it("Should bind the Scalar api reference page", () => {
        const page = container.get(API_REFERENCE_PAGE);

        expect(page).toBeInstanceOf(ApiReferenceScalarAdapter);
    });

    it.each(DOCS_CONTROLLERS)("Should bind the $implementation.name", ({ identifier, implementation }) => {
        const controller = container.get(identifier);

        expect(controller).toBeInstanceOf(implementation);
    });

    it.each(DOCS_CONTROLLERS)("Should bind the $implementation.name as an http controller", ({ identifier }) => {
        const controllers = container.getAll(HTTP_CONTROLLER);

        expect(controllers).toContain(container.get(identifier));
    });
});
