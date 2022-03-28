// Calculate column names of from/joins necessary for select/where/group/order etc.

type ComputeAllIdentifiers<From, Identifier> =
  Identifier extends infer X ? `${string & From}__${string & X}` : never

type ComputeAllJoins<Schema, Join> =
  Join extends {table: infer Table, as: infer As}
    ? Table extends keyof Schema
      ? unknown extends As
        ? ComputeAllIdentifiers<Table, Schema[Table]>
        : ComputeAllIdentifiers<As, Schema[Table]>
      : never
    : never

export type ComputeFrom<Schema, From> =
    [From] extends [string]
      ? From extends keyof Schema
        ? ComputeAllIdentifiers<From, Schema[From]>
        : never
      : From extends [infer OldName, infer AliasName]
        ? OldName extends string
          ? AliasName extends string
            ? OldName extends keyof Schema
              ? ComputeAllIdentifiers<AliasName, Schema[OldName]>
              : never
            : [keyof Schema, string]
          : [keyof Schema, string]
        : never

export type ComputeFromAndJoins<Schema, From, Joins> =
  [unknown] extends [From]
    ? [unknown] extends [Joins]
      ? ComputeFrom<Schema, From>
      : ComputeFrom<Schema, From> | ComputeAllJoins<Schema, Joins>
    : unknown
