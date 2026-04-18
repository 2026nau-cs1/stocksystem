export const toDrizzleInsert = <TInsert>(data: unknown): TInsert => data as TInsert;

export const withUpdatedAt = <TData extends object>(data: TData): TData & { updatedAt: Date } => ({
  ...data,
  updatedAt: new Date(),
});
