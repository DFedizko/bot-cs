import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/accounts/$accountId/")({
    beforeLoad: ({ params }) => {
        throw redirect({ to: "/accounts/$accountId/wanted-items", params });
    },
});
