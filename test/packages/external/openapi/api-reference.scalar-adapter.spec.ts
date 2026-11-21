import { ApiReferenceScalarAdapter } from "@/packages/external/openapi/api-reference.scalar-adapter";

const DOCUMENT_URL = "/openapi.json";
const TITLE = "Foo API";

const render = () => new ApiReferenceScalarAdapter(TITLE).render(DOCUMENT_URL);

describe("ApiReferenceScalarAdapter", () => {
    it("Should render an html page", () => {
        const page = render();

        expect(page.toLowerCase()).toStartWith("<!doctype html>");
    });

    it("Should title the page", () => {
        const page = render();

        expect(page).toContain(`<title>${TITLE}</title>`);
    });

    it("Should load the Scalar api reference", () => {
        const page = render();

        expect(page).toContain("@scalar/api-reference");
    });

    it("Should point the api reference at the document", () => {
        const page = render();

        expect(page).toContain(DOCUMENT_URL);
    });
});
