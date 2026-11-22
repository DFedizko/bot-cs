import { createRootRouteWithContext } from "@tanstack/react-router";
import type { RouterContext } from "@/app/router-context";
import { RootLayout } from "@/shared/ui/layouts/root.layout";

export const Route = createRootRouteWithContext<RouterContext>()({ component: RootLayout });
