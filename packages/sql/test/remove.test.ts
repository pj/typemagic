import {remove} from '../src';

test('remove', async () => {
  expect(
    remove(
      {'test': ['column1', 'column2']}, 
      {from: 'test', where: {not: true}}
    )
  ).toMatchSnapshot();
});