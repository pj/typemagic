import express from "express";
import { graphqlHTTP } from "express-graphql";
import { GraphQLError } from "graphql";
import util from "util";
import tsgql from "@typeshaman/graphql";

function graphQLErrors(error: GraphQLError) {
  const errorMessage = ({
    message: error.message,
    locations: error.locations,
    stack: error.stack,
    source: error.source,
  }) as any;

  console.log(
    util.inspect(
      errorMessage,
      {
        depth: null,
        sorted: true,
        colors: true,
      }
    )
  );
  return errorMessage;
}

(async () => {
  const app = express();
  app.use(
    "/graphql",
    graphqlHTTP({
      schema: schema,
      customFormatErrorFn: graphQLErrors,
      graphiql: true
    })
  );
  app.listen(3000)
  console.log(`Server started: ${3000}`);
})();
