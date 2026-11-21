import { ApiReferenceScalarAdapter } from "@/packages/external/openapi/api-reference.scalar-adapter";

const DOCUMENT_URL = "/openapi.json";
const TITLE = "Foo API";

const render = () => new ApiReferenceScalarAdapter(TITLE).render(DOCUMENT_URL);

describe("ApiReferenceScalarAdapter", () => {
    it("Should render an html page", () => {
        const page = render();

        expect(page).toStartWith("<!doctype html>");
    });

    it("Should title the page", () => {
        const page = render();

        expect(page).toContain(`<title>${TITLE}</title>`);
    });

    it("Should load a pinned version of the Scalar api reference", () => {
        const page = render();

        expect(page).toMatch(/cdn\.jsdelivr\.net\/npm\/@scalar\/api-reference@\d+\.\d+\.\d+\/esm\.js/);
    });

    it("Should point the api reference at the document", () => {
        const page = render();

        expect(page).toContain(`createApiReference("#app", { url: "${DOCUMENT_URL}" })`);
    });
});
