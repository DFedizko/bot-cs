import { definePort } from "../define-port";

const SIDEBAR_PREFERENCE_PORT = "SidebarPreference";

export interface SidebarPreference {
    readOpen: () => boolean;
}

export const { Provider: SidebarPreferenceProvider, usePort: useSidebarPreference } =
    definePort<SidebarPreference>(SIDEBAR_PREFERENCE_PORT);
