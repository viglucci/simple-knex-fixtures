[![Build Status](https://travis-ci.org/viglucci/simple-knex-fixtures.svg?branch=master)](https://travis-ci.org/viglucci/simple-knex-fixtures)
[![codecov](https://codecov.io/gh/viglucci/simple-knex-fixtures/branch/master/graph/badge.svg)](https://codecov.io/gh/viglucci/simple-knex-fixtures)

simple-knex-fixtures
====================

A simple library to help you load data to a database to facilitate testing.

Caveats:

- does not protect against duplicate records

### Install

```bash
npm install --save simple-knex-fixtures
```

### Test

```bash
npm test
```

### Usage

```javascript
const connection = require("knex")({
  client: "mysql",
  connection: {
    host : "127.0.0.1",
    user : "your_database_user",
    password : "your_database_password",
    database : "myapp_test"
  }
});

const fixtures = require("simple-knex-fixtures");

await fixtures.loadFile("fixtures/file.json", connection)

await fixtures.loadFiles("fixtures/*.json", connection)

await fixtures.loadFiles([
    "fixtures/file1.json",
    "fixtures/file2.json",
], connection);
```

### File formats

#### javascript

```javascript
module.exports = [
  {
    "table": "users",
    "data": {
      "id": 1,
      "first": "john",
      "last": "doe"
    }
  }
];
```

#### json

```json
[
  {
    "table": "users",
    "data": {
      "id": 1,
      "first": "john",
      "last": "doe"
    }
  }
]
```

#### yaml

```yaml
fixtures:
  -
    table: users
    data:
      id: 1
      first: john
      last: doe
```