import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";
import { AccountsHttpService, AccountsServiceProvider } from "@/features/accounts";
import { WantedItemsHttpService, WantedItemsServiceProvider } from "@/features/wanted-items";
import { createWindowKeyboardShortcuts } from "@/shared/adapters/create-window-keyboard-shortcuts";
import { readShortcutModifier } from "@/shared/adapters/read-shortcut-modifier";
import { readSidebarCookie } from "@/shared/adapters/read-sidebar-cookie";
import { useCommandPaletteStore } from "@/shared/adapters/store/command-palette.store";
import { useFailedImagesStore } from "@/shared/adapters/store/failed-images.store";
import { HttpClientProvider } from "@/shared/lib/http/http-client";
import type { HttpClient } from "@/shared/lib/http/http-client";
import { KeyboardShortcutsProvider } from "@/shared/lib/keyboard/keyboard-shortcuts";
import { ShortcutPlatformProvider } from "@/shared/lib/keyboard/shortcut-platform";
import type { ShortcutPlatform } from "@/shared/lib/keyboard/shortcut-platform";
import { SidebarPreferenceProvider } from "@/shared/lib/sidebar/sidebar-preference";
import { CommandPaletteStoreProvider } from "@/shared/lib/store/command-palette.store";
import { FailedImagesStoreProvider } from "@/shared/lib/store/failed-images.store";

export type AppDependencies = {
    queryClient: QueryClient;
    httpClient: HttpClient;
    shortcutPlatform?: ShortcutPlatform;
};

type AppProvidersProps = AppDependencies & { children: ReactNode };

const sidebarPreference = { readOpen: () => readSidebarCookie() };
const browserShortcutPlatform: ShortcutPlatform = { readModifier: () => readShortcutModifier() };
const keyboardShortcuts = createWindowKeyboardShortcuts();

export function AppProviders({
    queryClient,
    httpClient,
    shortcutPlatform = browserShortcutPlatform,
    children,
}: AppProvidersProps) {
    const [accountsService] = useState(() => new AccountsHttpService(httpClient));
    const [wantedItemsService] = useState(() => new WantedItemsHttpService(httpClient));
    return (
        <QueryClientProvider client={queryClient}>
            <HttpClientProvider value={httpClient}>
                <FailedImagesStoreProvider value={useFailedImagesStore}>
                    <CommandPaletteStoreProvider value={useCommandPaletteStore}>
                        <SidebarPreferenceProvider value={sidebarPreference}>
                            <ShortcutPlatformProvider value={shortcutPlatform}>
                                <KeyboardShortcutsProvider value={keyboardShortcuts}>
                                    <AccountsServiceProvider value={accountsService}>
                                        <WantedItemsServiceProvider value={wantedItemsService}>
                                            {children}
                                        </WantedItemsServiceProvider>
                                    </AccountsServiceProvider>
                                </KeyboardShortcutsProvider>
                            </ShortcutPlatformProvider>
                        </SidebarPreferenceProvider>
                    </CommandPaletteStoreProvider>
                </FailedImagesStoreProvider>
            </HttpClientProvider>
        </QueryClientProvider>
    );
}
