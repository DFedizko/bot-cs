import type { ApiReferencePage } from "@/packages/infrastructure/http/docs/api-reference.page";

const SCALAR_SCRIPT = "https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.82.1/esm.js";
const MOUNT_POINT = "#app";

export class ApiReferenceScalarAdapter implements ApiReferencePage {
    constructor(private readonly title: string) {}

    render(documentUrl: string): string {
        return [
            "<!doctype html>",
            '<html lang="en">',
            "<head>",
            `<title>${this.title}</title>`,
            '<meta charset="utf-8" />',
            '<meta name="viewport" content="width=device-width, initial-scale=1" />',
            "</head>",
            "<body>",
            `<div id="${MOUNT_POINT.slice(1)}"></div>`,
            '<script type="module">',
            `import { createApiReference } from "${SCALAR_SCRIPT}";`,
            `createApiReference("${MOUNT_POINT}", { url: "${documentUrl}" });`,
            "</script>",
            "</body>",
            "</html>",
        ].join("\n");
    }
}
