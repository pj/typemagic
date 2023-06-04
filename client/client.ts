import { ArgumentNode, DocumentNode, FieldNode, NameNode, ObjectFieldNode, OperationTypeNode, print, SelectionNode, SelectionSetNode, TypeNode, ValueNode, VariableDefinitionNode, VariableNode } from "graphql";
import { CustomScalar } from "../server/custom_scalar.js";
import { OutputObject, ValidateSchema } from "../server/schema.js";
import { Constructor, Exact, Expand, IsSchemaScalar, ScalarTypes, UnionToIntersection } from "../server/types.js";
import { UnionTypeNames } from "../server/union.js";

export type FieldSentinel = {};
export const _: FieldSentinel = {};

export type GenerateVariableDefinition<Arg> =
  {
    $defaultValue?: Arg,
    $name: string
  }

export type GenerateArgsVariables<FunctionArgs, ArgsFields> =
  {
    [Key in keyof FunctionArgs]: 
      Key extends keyof ArgsFields
        ? FunctionArgs[Key] | GenerateVariableDefinition<FunctionArgs[Key]>
        : never
  }

export type GenerateArgsField<Type, ResolverFunction, ArgsFields> =
  [unknown] extends [ArgsFields]
    ? Type
    : undefined extends ArgsFields
      ? Type
      : ResolverFunction extends (args: infer Args, root: infer Root, context: infer Context) => any
        ? { $args: GenerateArgsVariables<Args, ArgsFields>, $fields: Type }
        : never

export type GenerateObjectType<Query, Type, ResolverFunction, ArgsFields> =
  [Type] extends [{ fields: infer ObjectFields }]
    ? unknown extends ArgsFields
      ? GenerateQuery<Query, ObjectFields>
      : undefined extends ArgsFields
        ? GenerateQuery<Query, ObjectFields>
        : ResolverFunction extends (args: infer Args, root: infer Root, context: infer Context) => any
          ? Query extends { $fields: infer QueryFields }
            ? { $args: GenerateArgsVariables<Args, ArgsFields>, $fields: GenerateQuery<QueryFields, ObjectFields> }
            : { $args: GenerateArgsVariables<Args, ArgsFields>, $fields: GenerateQuery<{}, ObjectFields> }
          : never
    : "Unable to determine type"

type UnionItemForName<UnionType, Name> =
  UnionType extends { name: infer UnionName }
    ? Exact<Name, UnionName> extends true
      ? UnionType
      : never
    : never

export type GenerateQueryField<Query, Resolver> =
  [Resolver] extends [
    {
      type: infer Type,
      argsFields?: infer ArgsFields
      resolve?: infer ResolverFunction
    }
  ]
  ? (
    Type extends { enum: infer Enum }
      ? GenerateArgsField<FieldSentinel, ResolverFunction, ArgsFields>
      : IsSchemaScalar<Type> extends true
        ? GenerateArgsField<FieldSentinel, ResolverFunction, ArgsFields>
        : Type extends { union: infer UnionTypes }
          ? UnionTypes extends Readonly<unknown[]>
            ? Query extends { $on: infer QueryTypes }
              ? {
                __typename?: FieldSentinel,
                $on: {
                  [Key in keyof QueryTypes]?:
                    Key extends UnionTypeNames<UnionTypes[number]>
                    ? UnionItemForName<UnionTypes[number], Key> extends { fields: infer Fields }
                      ? {
                        [FieldKey in keyof Fields]?: GenerateQueryField<QueryTypes[Key], Fields[FieldKey]>
                      }
                      : never
                  : never
                }
              }
              : { $on: { [Key in keyof UnionTypeNames<UnionTypes>]?: {} } }
            : "Should not happen"
          : Type extends CustomScalar<infer Input, infer Serialized>
              ? FieldSentinel
              : GenerateObjectType<Query, Type, ResolverFunction, ArgsFields>
    )
  : Resolver extends ScalarTypes
    ? FieldSentinel
    : Resolver extends CustomScalar<infer Input, infer Serialized>
      ? FieldSentinel
      : "Invalid resolver"

export type GenerateQuery<Query, Schema> = {
  [Key in (keyof Query | keyof Schema)]?:
    Key extends keyof Schema
      ? Key extends keyof Query
        ? GenerateQueryField<Query[Key], Schema[Key]>
        : never
      : never
}

export type GenerateSchema<Query, Schema> = 
  [Schema] extends [{mutations?: infer Mutations, queries?: infer Queries}]
    ? GenerateQuery<Query, Mutations> | GenerateQuery<Query, Queries>
    : never

export type GenerateVariable<Query> = 
  Query extends object
    ? Query extends {$name: infer Name, $defaultValue?: infer Arg}
      ? {[X in keyof Query as Name extends string ? Name : never]: Arg}
      : {[Key in keyof Query]: GenerateVariable<Query[Key]>}[keyof Query]
    : never

export type GenerateVariables<Query> = 
  Expand<UnionToIntersection<GenerateVariable<Query>>> extends infer Variables
    ? {} extends Variables
      ? {variables?: undefined}
      : {variables: Variables}
    : never

function getVariableType(schema: any) {
  switch (schema) {
    case 'Float':
      return 'Float'
    case 'Int':
      return 'Int'
    case 'String':
      return 'String'
    case 'Boolean':
      return 'Boolean'
    default:
      switch (schema.type) {
        case 'Float':
          return 'Float'
        case 'Int':
          return 'Int'
        case 'String':
          return 'String'
        case 'Boolean':
          return 'Boolean'
        default:
          if (schema.type instanceof CustomScalar) {
            return schema.type.scalar.name;
          }
          return schema.type.name
      }
    }
}

function queryArgValue(schema: any, arg: any, variables: QueryVariables): ValueNode {
  // Literals
  if (arg === null) {
    return { kind: 'NullValue' };
  }

  let value: ValueNode | null = null;
  if (typeof arg === 'string') {
    value = { kind: 'StringValue', value: arg };
  }

  if (typeof arg === 'boolean') {
    value = { kind: 'BooleanValue', value: arg };
  }

  if (typeof arg === 'number') {
    switch (schema) {
      case 'Float':
        value = { kind: 'FloatValue', value: arg.toString() };
        break;
      case 'Int':
        value = { kind: 'IntValue', value: arg.toString() };
        break;
      default:
        throw new Error();
    }
  }

  if (Array.isArray(arg)) {
    let values = [];
    for (let value of arg) {
      const listValue = queryArgValue(schema, value, variables);
      values.push(listValue)
    }
    value = { kind: "ListValue", values: values };
  }

  if (value) {
    return value;
  }

  if ('$name' in arg) {
    const variableDefinition = variables.get(arg.$name);
    if (variableDefinition) {
      return variableDefinition.variable;
    } else {
      const variable: VariableNode = ({
        kind: 'Variable',
        name: {
          kind: 'Name',
          value: arg.$name
        }
      });

      let variableType: TypeNode = {kind: 'NamedType', name: {kind: 'Name', value: getVariableType(schema)}};
      if (schema.array === 'nullable_items') {
        variableType = {kind: 'ListType', type: variableType};
      } else if (schema.array) {
        variableType = {kind: 'ListType', type: {kind: 'NonNullType', type: variableType}};
      }

      if (!schema.nullable) {
        variableType = {kind: 'NonNullType', type: variableType};
      }

      variables.set(
        arg.$name, 
        {
          kind: 'VariableDefinition',
          variable: variable,
          defaultValue: arg.$defaultValue,
          type: variableType
        }
      );

      return variable;
    } 
  } else {
    let values: ObjectFieldNode[] = [];
    for (let [name, field] of Object.entries<any>(arg)) {
      const listValue = queryArgValue(field, schema.type.fields[name], variables);
      values.push({
        kind: "ObjectField",
        name: {
          kind: "Name",
          value: name
        }, 
        value: listValue
      });
    }
    return (
      {
        kind: "ObjectValue",
        fields: values
      }
    ); 
  }

}

function queryArgs(schema: any, args: any, variables: QueryVariables): ArgumentNode[] | undefined {
  if (args) {
    const argNodes: ArgumentNode[] = [];

    for (let [name, arg] of Object.entries<any>(args)) {
      let argValue = queryArgValue(schema[name], arg, variables);
      argNodes.push(
        {
          kind: 'Argument',
          name: { kind: 'Name', value: name },
          value: argValue
        }
      );
    }

    return argNodes;
  } else {
    return undefined;
  }
}

function queryFields(
  schema: any, 
  queryValue: any, 
  variables: QueryVariables
): SelectionNode[] {
  let fieldNodes: SelectionNode[] = [];
  for (let [name, field] of Object.entries<any>(queryValue)) {
    if (field === _) {
      fieldNodes.push(
        {
          kind: 'Field',
          name: { kind: 'Name', value: field.alias || name },
        }
      );
      continue;
    }

    const [selectionSet, args] = queryObject(
      schema[name], 
      field, 
      variables
    );

    fieldNodes.push(
      {
        kind: 'Field',
        name: { kind: 'Name', value: field.alias || name },
        selectionSet,
        arguments: args
      }
    );
  }

  return fieldNodes;
}

function queryObject(
  schema: any, 
  queryValue: any, 
  variables: QueryVariables
): [SelectionSetNode, ArgumentNode[] | undefined] {
  let fieldNodes: SelectionNode[] = [];
  let argumentNodes: ArgumentNode[] | undefined;
  if ('$args' in queryValue) {
    argumentNodes = queryArgs(schema.argsFields, queryValue.$args, variables);
    fieldNodes = queryFields(schema.type.fields, queryValue['$fields'], variables);
  } else if ('$on' in queryValue) {
    for (let [abstractName, abstractFields] of Object.entries<any>(queryValue['$on'])) {
      let x = null;
      if ('union' in schema.type) {
        for (let item of schema.type.union) {
          if (item.name === abstractName) {
            x = item
          }
        }
      }
      if ('interfaces' in schema.type) {
        for (let item of schema.type.interfaces) {
          if (item.name === abstractName) {
            x = item
          }
        }
      }
      const fragmentNodes = queryFields(
        x,
        abstractFields, 
        variables
      );
      if (fragmentNodes.length > 0) {
        fieldNodes.push({
          kind: 'InlineFragment',
          selectionSet: {
            kind: 'SelectionSet',
            selections: fragmentNodes,
          }, 
          typeCondition: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: abstractName
            }
          }
        });
      }
    }
  } else {
    fieldNodes = queryFields(schema.type.fields, queryValue, variables);
  }

  return ([
    {
      kind: 'SelectionSet',
      selections: fieldNodes,
    }, 
    argumentNodes
  ]);
}

type QueryVariables = Map<string, VariableDefinitionNode>;

export function operation<
  Root, 
  Context,
  Schema extends ValidateSchema<Schema, Root, Context>,
  Operation extends GenerateSchema<Operation, Schema>
>
(
  schema: Schema,
  operation: Operation,
  operationType: OperationTypeNode,
  options?: {
    context?: Context | Constructor<Context>,
    root?: Root | Constructor<Root>,
    queryName?: string,
  }
): DocumentNode {
  const queryNameNode: NameNode | undefined = options?.queryName ? { kind: 'Name', value: options.queryName } : undefined;
  const variables: QueryVariables = new Map();
  const selections = queryFields(
    schema[operationType === 'query' ? 'queries' : 'mutations'], 
    operation, 
    variables
  );
  return ({
    kind: 'Document',
    definitions: [
      {
        kind: 'OperationDefinition',
        operation: operationType,
        name: queryNameNode,
        selectionSet: {
          kind: 'SelectionSet',
          selections
        },
        variableDefinitions: Array.from(variables.values())
      }
    ]
  });
}

export function operationGQL<
  Root, 
  Context,
  Schema extends ValidateSchema<Schema, Root, Context>,
  Query extends GenerateSchema<Query, Schema>
>(
  schema: Schema,
  query: Query,
  operationType: OperationTypeNode,
  options?: {
    context?: Context | Constructor<Context>,
    root?: Root | Constructor<Root>,
    queryName?: string,
  }
): string {
  const document = operation(schema, query, operationType, options);
  return print(document);
}

export function query<
  Root, 
  Context,
  Schema extends ValidateSchema<Schema, Root, Context>,
  Query extends GenerateSchema<Query, Schema>
>
(
  schema: Schema,
  query: Query,
  options?: {
    context?: Context | Constructor<Context>,
    root?: Root | Constructor<Root>,
    queryName?: string,
  }
): DocumentNode {
  return operation(schema, query, 'query', options);
}

export function queryGQL<
  Root, 
  Context,
  Schema extends ValidateSchema<Schema, Root, Context>,
  Query extends GenerateSchema<Query, Schema>
>(
  schema: Schema,
  query: Query,
  options?: {
    context?: Context | Constructor<Context>,
    root?: Root | Constructor<Root>,
    queryName?: string,
  }
): string {
  const document = operation(schema, query, 'query', options);
  return print(document);
}

export function mutation<
  Root, 
  Context,
  Schema extends ValidateSchema<Schema, Root, Context>,
  Query extends GenerateSchema<Query, Schema>
>
(
  schema: Schema,
  query: Query,
  options?: {
    context?: Context | Constructor<Context>,
    root?: Root | Constructor<Root>,
    queryName?: string,
  }
): DocumentNode {
  return operation(schema, query, 'mutation', options);
}

export function mutationGQL<
  Root, 
  Context,
  Schema extends ValidateSchema<Schema, Root, Context>,
  Query extends GenerateSchema<Query, Schema>
>(
  schema: Schema,
  query: Query,
  options?: {
    context?: Context | Constructor<Context>,
    root?: Root | Constructor<Root>,
    queryName?: string,
  }
): string {
  const document = operation(schema, query, 'mutation', options);
  return print(document);
}