# cheat-h2.js
#### _"It so simple it feels like cheating"_
[![Build Status](https://travis-ci.org/andham97/cheat-h2.js.svg?branch=master)](https://travis-ci.org/andham97/cheat-h2.js)
[![codecov](https://codecov.io/gh/andham97/cheat-h2.js/branch/master/graph/badge.svg)](https://codecov.io/gh/andham97/cheat-h2.js)

## Introduction

## Implemented functionality
1. TLS
2. Connection preface
3. Datawrapper from frames
4. Headercompression with hpack
5. Flow control
6. Stream priority
7. Error handeling
8. Connection management
9. Cross protocols attach

## TODO
1. Error handeling stream concurancy
2. Stream priority
3. Server push
4. API
5. HTTP headerfields
6. Connect method see section 10.3
7. Response and request extentions
8. DOS security see section 10.5
9. Server authority see section 10.1
10. IE attach see section 10.3

## Installation
cheat-h2.js is available through the NPM registry.

Before installing note that Node.js 9.3.0 or higher is required.

Installation is done using the `npm install` command:
```bash
$ npm install cheath2.js
```

## Usage
```javascript
import cheath2 from 'cheath2.js';
import fs from 'fs';

let server = new cheath2({
  key: fs.readFileSync('<directory of private-key>'),
  cert: fs.readFileSync('<directory of public-cert>')
});

server.get('/', (req, res) => {
  res.headers['content-encoding'] = 'text/plain';
  res.status(200).send('Hello world!');
});

server.listen(8000);
```

## Tests


## API documentation
