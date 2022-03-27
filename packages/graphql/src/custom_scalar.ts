import { GraphQLScalarType } from "graphql";
import { Exact } from "./types";

export class CustomScalar<Type> {
  constructor(
    public scalar: GraphQLScalarType,
  ) {}
}

export function customScalar<Type = never>(scalar: GraphQLScalarType) {
  return new CustomScalar<Type>(scalar);
}

export type HandleCustomScalar<ScalarType, ReturnType> =
  [Exact<ScalarType, ReturnType>] extends [true]
    ? {type: CustomScalar<ReturnType>}
    : "Scalar must have a type specified equal to the return type"
