import { ScalarOrInput } from "./input";
import { Constructor } from "./types";

export type ArgsRuntimeSchema<Obj> = {
  [FieldName in keyof Obj]: 
    ScalarOrInput<Obj[FieldName]>
} 

export type ArgsObject<O> = {
  type: Constructor<O>,
  runtimeTypes: ArgsRuntimeSchema<O>,
};