Typeshaman Graphql (TSGQL) is a layer over graphql-js that provides a much more typesafe way to create a schema.

TSGQL guides you to write a correct schema that is based on the types/classes and resolve functions. TSGQL extracts the arguments, return type, root type and related objects and creates a type that represents what the schema should be based on the typescript types. 

It also includes code to help build graphql queries and validate variables based on TSGQL schemas that can be used by graphql clients.

# Server

The `build` function takes a schema and returns an object can be passed to `express-graphql` to serve the generated schema as usual:

```typescript

const graphqlSchema = 


```


## as const

TSGQL is dependent on typescript narrowing types i.e. when setting a field to be a graphql `String` the type of the field has to be the string literal `String` NOT the `string` type:

```typescript


```

To ensure that you're types are narrowed properly it's worth adding `as const` after you're schema definitions. 

If you see an unexpected type error, check that you have `as const` after the object to see if it fixes the problem.

## Resolve Functions

Resolve functions



Resolve functions can either have a

The graphql type schema is defined on the `type` field

Resolve functions are optional

## Helpers

You can base your return types off basic type definitions and classes: 

Classes have one advantage - they can be passed into some of the helper functions 


Packing you're entire schema into a single object 

Breaking the schema up into separate objects , however errors will be at the place where you call build, rather than on the specific fields


## Null and Arrays

The nullable and array fields on the resolve object 

## Scalars

TSGQL supports the built in Scalar types `String`, `Float`, `Int`, `Boolean`, set the type to one of

If an object field  is a field on the root object and is non null and not an array, you can just set the field name to one of the built in scalar types.

and you don't need a custom resolver you can just set the field directly 

```typescript
build({
  queries:
})
```

## Objects


Additional fields can also be defined on objects, but require a resolve function, since the field can't be automatically looked up on the root type.

## Arguments

TSGQL will automatically infer whether the first argument to the resolve function is not the root and require you to add a schema for the arguments option in the `argFields` field:

```

```


## Custom scalars

## Unions

NB: Union names must be literal strings.

## Interfaces


# Client


## Client and helpers
- [ ] Helpers/Fragments for querying
- [ ] Hooks client
- [ ] graphql request client.

## Testing
- [ ] Move all existing tests to testQuery.
- [ ] Test enums
- [ ] integration test with real server.

## Documentation
- [ ] README.md
- [ ] Blog post.
- [ ] Backend/Frontend example.
- [ ] Comments in code.
- [ ] API docs.
- [ ] Demo video

## Nice to haves
- [ ] Infer all possible names of interface implementations to fix return type?
- [ ] Check all types in union for an isTypeOf and require resolve type if it doesn't exist
- [ ] check enum type is actually enum, similar or introduce separate type.
- [ ] force union names to be narrower than strings.
- [ ] Proper typing in client generation.
- [ ] Better error handling

## Aditional Features
- [ ] Subscriptions
- [ ] Extensions?
- [ ] Directives?
