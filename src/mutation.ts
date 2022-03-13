import { ArgsSchema } from "./input";
import { Resolver } from "./output";
import { GenerateNullabilityAndArrayRuntimeOptions, GetRuntimeType, IsCompileTimeScalar } from "./types";

export type Mutation<Context, Args, OutputType> = 
  {
    args: ArgsSchema<Args>,
    mutate: (args: Args, context: Context) => Promise<OutputType>;
    type: GetRuntimeType<OutputType>
  } 
    & GenerateNullabilityAndArrayRuntimeOptions<OutputType>
    & (
      [IsCompileTimeScalar<OutputType>] extends [false] 
        ? {
            runtimeTypes: {
              [FieldName in keyof OutputType]?: 
                Resolver<OutputType, Context, unknown, OutputType[FieldName]>
            }
          }
        : {}
    )
