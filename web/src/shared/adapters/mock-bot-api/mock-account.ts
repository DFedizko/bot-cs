import type { paths } from "@/shared/api/bot-api";

export type MockAccount = paths["/accounts"]["get"]["responses"][200]["content"]["application/json"]["items"][number];
