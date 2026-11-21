import { renderApiReference } from "@scalar/client-side-rendering";
import type { ApiReferencePage } from "@/packages/infrastructure/http/docs/api-reference.page";

export class ApiReferenceScalarAdapter implements ApiReferencePage {
    constructor(private readonly title: string) {}

    render(documentUrl: string): string {
        return renderApiReference({ config: { url: documentUrl }, pageTitle: this.title });
    }
}
