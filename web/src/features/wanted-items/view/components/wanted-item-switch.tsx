import { Switch } from "@/shared/ui/components/switch";

type WantedItemSwitchProps = { name: string; enabled: boolean; onToggle: (name: string, enabled: boolean) => void };

export function WantedItemSwitch({ name, enabled, onToggle }: WantedItemSwitchProps) {
    return (
        <Switch
            aria-label={`Bid on ${name}`}
            checked={enabled}
            onCheckedChange={(checked) => onToggle(name, checked)}
        />
    );
}
