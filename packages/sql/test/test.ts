import {JoinTypes} from '../src';

class RelatedTable {
  constructor(
    public id: number,
    public address: string,
  ) {

  }
}
class TestTable {
  constructor(
    public id: number,
    public name: string,
    public related: RelatedTable[]
  ) {
  }
}

class AnotherRelatedTable {
  constructor(
    public id: number,
    public food: string,
  ) {

  }
}

const query = {
  select: [
    // All columns,
    '*',

    // All related columns
    {
      table: RelatedTable,
      column: '*'
    },

    // names from default table
    'id',
    'name',

    // Fields from specified table.
    {
      TestTable: [
        'address'
      ]
    },
    [TestTable, 'address'],
    { TestTable: 'address' },
    
    // aliased table
    ['AnotherTable', 'address'],

    // Field with alias
    {
      column: 'name',
      as: 'firstName'
    },

    // Summed field
    { 
      sum: 'id'
    }
  ],

  // Single table, don't join,
  fromDefault: {
    source: TestTable,
    schema: {
      id: {
        nullable: false,
        type: 'int'
      }
    }
  },
  from: {
    table: TestTable,
    join: [
      // Short form for left join?
      [RelatedTable, 'id', 'id'],
      [RelatedTable, 'id', AnotherRelatedTable, 'id'],
      {
        // Join 'Default' table
        table: RelatedTable, 

        // from to other table
        from: [TestTable, 'id'],
        to: [RelatedTable, 'id'],

        // from: {
        //   table: TestTable,
        //   as: 'AnotherTable' 
        // },
        // to: {
        //   table: RelatedTable,
        //   as: 'AnotherRelatedTable'
        // },
        // Specific join types
        type: JoinTypes.FullOuterJoin,
        on: {
          eq: [
            {
              table: TestTable, 
              field: 'id'
            },
            {
              table: RelatedTable, 
              field: 'id'
            },
          ]
        }
      },
    ]
  }
}
