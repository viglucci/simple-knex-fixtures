[![Build Status](https://travis-ci.org/viglucci/simple-knex-fixtures.svg?branch=master)](https://travis-ci.org/viglucci/simple-knex-fixtures) [![Coverage Status](https://coveralls.io/repos/github/viglucci/simple-knex-fixtures/badge.svg?branch=master)](https://coveralls.io/github/viglucci/simple-knex-fixtures)

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
//connection is a intialized knex connection

var fixtures = require("simple-knex-fixtures");

fixtures.loadFile("fixtures/file.json", connection)
.then(somethingElse);

fixtures.loadFiles("fixtures/*.json", connection)
.then(somethingElse);

fixtures.loadFiles([
    "fixtures/file1.json",
    "fixtures/file2.json",
], connection)
.then(somethingElse);
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