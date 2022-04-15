Typeshaman Graphql (TSGQL) is a layer over graphql-js that provides a much more typesafe way to create a schema.

TSGQL guides you to write a correct schema that is based on the types/classes and resolve functions. TSGQL uses the arguments and return types of resolver functions to determine what you need to pass to generate a correct graphql schema. 

It also includes code to help build graphql queries and validate variables based on TSGQL schemas that can be used by graphql clients.

# Server

The `build` function takes a schema and returns an graphql js objects can be passed to `express-graphql` to serve the generated schema as usual:

```typescript

const graphqlSchema = 


```

Packing your entire schema into a single object makes composition hard and can be difficult to read. At first glance you might try breaking the schema up into separate objects, while this is possible errors will be highlighted at the place where you call build, rather than on the specific fields, which can make debugging issues harder.

To make this easier there are a couple of helpers to build partial schemas that can be combined to create a full schema:

One wrinkle of this is that the helpers can't infer the root type and context type and so you need to provide them to the helper functions.

Due to the fact that typescript doesn't have partial type inference you can't pass the types in using generics, so you have to pass the type to the helpers by passing the type as a dummy variable or as a class.

## as const

TSGQL is dependent on typescript narrowing types i.e. when setting a field to be a graphql `String` the type of the field has to be the string literal `String` NOT the `string` type:

```typescript
// Type of notNarrow is `string`
const notNarrow = 'asdf';

// Type of narrow is `'asdf'`
const narrow = 'asdf' as const;

// Type of notNarrowObject is: 
// {
//    type: string, 
//    resolve: () => string
//  }
const notNarrowObject = {
  type: "String",
  resolve: () => "test"
};

// Type of notNarrowObject is: 
// {
//    type: "String", 
//    resolve: () => string
//  }
const notNarrowObject = {
  type: "String",
  resolve: () => "test"
} as const;
```

To ensure that you're types are narrowed properly it's worth adding `as const` after you're schema definitions. 

If you see an unexpected type error, check that you have `as const` after the object to see if it fixes the problem.

## Resolver

A Resolver corresponds to a `GraphQLFieldConfig` in graphql-js and combines a graphql type and an optional resolve function. If a resolve function isn't provided it defaults to looking up the field on the root object of the resolver.


```

```

The schema for the return type is provided in the `type` field and can be a scalar, enum, object or union.

If the return type includes null or is an array TSGQL will require some fields to be set on the Resolver. If the type is `string | null`, the `nullable` field must be set to true. For arrays, if the items of the array are nullable, the `array` field has to be set to `nullable_items` other wise it has to be set to true.

The return type is also checked against the root type to ensure that it matches what is expected in your data model.

A root type and context can also be specified and must match what is passed to the build function or helper functions:

```
```


## Arguments

TSGQL will automatically infer whether the first argument to the resolve function is the root or not and require you to add a schema for the arguments option in the `argFields` field:

```

```

This has similar options to the `type` field, but doesn't need a resolve function or support unions or interfaces.

## Scalars

TSGQL supports the built in Scalar types `String`, `Float`, `Int`, `Boolean`, set the type to one of

If an object field  is a field on the root object and is non null and not an array, you can just set the field name to one of the built in scalar types.

and you don't need a custom resolver you can just set the field directly 

```typescript
build({
  queries:
})
```

## Custom Scalars

Custom scalar types can be defined using the `customScalar` helper function, which takes a `GraphQLScalarTypeConfig`. Unfortunately `GraphQLScalarType` has the input and serialized type of the scalar as any.

```
```

## Objects

Objects are defined with a required name and `fields` field with the 

TSGQL doesn't have a good way of detecting that an object has been defined twice with the same name in the typesystem, so while building the schema at runtime the first time a name is seen is used as the object for that name. Right now there is no detection of whether two schema definitions differ.

Not every field on the object is required to have a type definition and additional fields can also be defined, but require a resolve function, since the field can't be automatically infered from the root type.

```
```

Input objects are similar, but don't support unions, interfaces or resolve functions.

```
```

## Unions

Unions are supported by providing a list of object types:

```
```


GraphQL requires a resolveType function to determine the type of union member to return or that each of the union member types define an isTypeOf method. 

The input type of the resolve function needs to be the same as the union members and the return type must be a union of the names of the union members.  To ensure that the correct type names are returned, union type names must be literal strings i.e. the following won't typecheck properly: 

```
```

Currently there is no detection of whether the member types all define an `isTypeOf` method, so the resolveType field is currently optional and can cause a runtime error if graphql-js detects that the types don't define `isTypeOf`

## Interfaces


Currently it's required to define fields in both the 

Currently there is no detection of whether you have defined a field

# Client

The client provides functions to generate a graphql-js document and graphql query strings. It also provides 

