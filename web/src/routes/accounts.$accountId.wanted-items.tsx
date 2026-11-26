import { createFileRoute } from "@tanstack/react-router";
import { WantedItemsPage } from "@/pages/wanted-items.page";

export const Route = createFileRoute("/accounts/$accountId/wanted-items")({ component: WantedItemsPage });
