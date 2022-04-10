import { select } from '../src';

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
            ['other', 'test.id', 'other.test_id'],
            ['another', 'another.id', 'test.id']
          ]
        } as const
      )
    ).toMatchSnapshot();
  }
);