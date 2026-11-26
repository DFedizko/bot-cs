import { FirstAccountRedirectView } from "./view/first-account-redirect.view";
import { useFirstAccountViewModel } from "./view-model/useFirstAccountViewModel";

export function FirstAccountRedirectScreen() {
    return <FirstAccountRedirectView {...useFirstAccountViewModel()} />;
}
