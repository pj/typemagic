import { ArrayToUnion, DuplicatedColumns, GenerateColumnNames, select, ValidateSelect } from '../src';

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

type X = 
  ValidateSelect<
    typeof schema, 
    ['test', 'renamed'], 
    [
      ['other', 'test.id', 'other.test_id']
    ],
    [
      ['renamed.id', 'renamed_id'], 
      ['other.id', 'other_id'],
      ['other.name', 'name'],
      'thing',
      'description'
    ]
  >

type D = DuplicatedColumns<
  typeof schema, 
  ['test', 'renamed'], 
  [
    ['other', 'other.test_id', 'test.id'],
    ['another', 'another.test_id', 'test.id']
  ]
>

type C = GenerateColumnNames<'test', 'renamed', ArrayToUnion<typeof schema, 'test'>, 'id' | never>

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
            ['other', 'test.id', 'other.test_id']
          ]
        } as const
      )
    ).toMatchSnapshot();
  }
);