export type SubsetPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type SubsetRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
