import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/components/select";

type PaginationPageSizeProps = {
    value: number;
    options: ReadonlyArray<number>;
    onValueChange: (pageSize: number) => void;
};

export function PaginationPageSize({ value, options, onValueChange }: PaginationPageSizeProps) {
    return (
        <Select value={value} onValueChange={(chosen) => chosen !== null && onValueChange(chosen)}>
            <SelectTrigger
                aria-label="Items per page"
                className="h-8 gap-2 rounded-md border-line bg-transparent px-3 text-sm text-faint"
            >
                Per page
                <SelectValue className="font-mono font-medium text-ink" />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option} value={option} className="font-mono">
                        {option}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
