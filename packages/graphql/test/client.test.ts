import { ScalarTypes } from "../src";
import { query, _ } from "../src/client";

test('clientASTGeneration', async () => {
  expect(
    query(
      {
        queries: {
          testQuery: {
            type: 'string',
            resolve: () => {
              return 'asdf';
            }
          }
        }
      },
      {
        testQuery: _
      }
    )
  ).toMatchSnapshot();
});