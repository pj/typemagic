import {query} from "../sql"

class TestTable {
  constructor(
    public id: number,
    public name: string,
  ) {

  }
}

// query({
//   select: {
//     id: true,
//     name: "A better name"
//   },
//   from: TestTable,
// })