import { AccountSwitcherView } from "./view/account-switcher.view";
import { useAccountSwitcherViewModel } from "./view-model/useAccountSwitcherViewModel";

type AccountSwitcherScreenProps = { accountId: string };

export function AccountSwitcherScreen({ accountId }: AccountSwitcherScreenProps) {
    return <AccountSwitcherView {...useAccountSwitcherViewModel(accountId)} />;
}
