import {ArrayToUnion, ColumnNamesForTable, DuplicatedColumns, select, Temp, ValidateSelect} from '../src';

const schema = {
  'test': [
    'id', 'name', 'description'
  ], 
  'other': [
    'id', 'name', 'thing', 'test_id'
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
    ['other', 'test.id', 'other.test_id']
  ]
>

type A = ArrayToUnion<typeof schema, 'test'>

type C = ColumnNamesForTable<typeof schema, 'test', 'renamed', 'id' | never>

type Z = Temp<'test', 'renamed', (typeof schema)['test'], 'id' | never>

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