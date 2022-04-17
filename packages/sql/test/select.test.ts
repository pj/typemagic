import { select, ValidateJoins } from '../src';

const schema = {
  'test': [
    'id', 'name', 'description'
  ], 
  'other': [
    'id', 'name', 'thing', 'test_id'
  ],
  'another': [
    'id', 'date', 'test_id'
  ]
} as const;

type X = ValidateJoins<
  typeof schema,
  ['test', 'renamed'],
  [
    ['other', 'test.id', 'other.test_id'],
    ['another', 'another.id', 'test.id']
  ]
>

test(
  'select', 
  async () => {
    expect(
      select(
        schema,
        {
          select: [
            ['renamed.id', 'renamed_id'], 
            ['other.id', 'other_id'],
            ['other.name', 'name'],
            'thing',
            'description'
          ], 
          from: ['test', 'renamed'],
          join: [
            ['other', 'other.test_id', 'renamed.id'],
            ['another', 'another.id', 'renamed.id']
          ]
        } as const
      )
    ).toMatchSnapshot();
  }
);