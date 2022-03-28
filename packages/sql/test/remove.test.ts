import {remove} from '../src';
import {ValidateDelete} from '../src/delete';

type X = ValidateDelete<{test: ['column1', 'column2']}, {from: 'asdf', where: {not: 10}}>

test('remove', async () => {
  expect(
    remove(
      {'test': ['column1', 'column2']}, 
      {from: 'test', where: {not: true}}
    )
  ).toMatchSnapshot();
});