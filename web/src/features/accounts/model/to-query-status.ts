export type QueryStatus = "loading" | "error" | "ready";

type QueryFlags = { isPending: boolean; isError: boolean };

export const toQueryStatus = ({ isPending, isError }: QueryFlags): QueryStatus => {
    if (isError) return "error";
    return isPending ? "loading" : "ready";
};
