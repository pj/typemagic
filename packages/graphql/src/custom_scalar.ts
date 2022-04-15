import { GraphQLScalarType, GraphQLScalarTypeConfig } from "graphql";
import { Exact } from "./types";

export class CustomScalar<Input, Serialized> {
  constructor(
    public scalar: GraphQLScalarTypeConfig<Input, Serialized>,
  ) {}
}

export function customScalar<Input, Serialized>(scalar: GraphQLScalarTypeConfig<Input, Serialized>) {
  return new CustomScalar<Input, Serialized>(scalar);
}

export type HandleCustomScalar<ScalarType, ReturnType, ScalarSerialized> =
  [Exact<ScalarType, ReturnType>] extends [true]
    ? {type: CustomScalar<ReturnType, ScalarSerialized>}
    : "Scalar must have a type specified equal to the return type"
