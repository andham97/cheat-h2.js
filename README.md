# cheat-h2.js
#### _"It so simple it feels like cheating"_
[![Build Status](https://travis-ci.org/andham97/cheat-h2.js.svg?branch=master)](https://travis-ci.org/andham97/cheat-h2.js)
[![codecov](https://codecov.io/gh/andham97/cheat-h2.js/branch/master/graph/badge.svg)](https://codecov.io/gh/andham97/cheat-h2.js)

A HTTP/2 implementation for Node.js conforming to [RFC7540](https://tools.ietf.org/html/rfc7540) and [RFC7541](https://tools.ietf.org/html/rfc7541)

## Implemented functionality
1. TLS
2. Connection preface
3. Datawrapper from frames
4. Headercompression with hpack
5. Flow control
6. Stream priority
7. Error handling
8. Connection management
9. Cross protocols attach
10. Error handling
11. Stream prioritization and concurrency
12. Server push (beta)

## TODO
1. Implement all [HTTP header fields](https://www.iana.org/assignments/message-headers/message-headers.xhtml)
2. Connect method see section 10.3
3. DOS security see section 10.5
4. Server authority see section 10.1
5. IE attach see section 10.3

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
While inside the project directory run:
```bash
$ npm install --dev
$ npm test
```


## API documentation
### Class:http2
* `key`: stores the PEM formatted private key
* `cert`: stores the PEM formatted public certificate
* `server`: stores the instance of the TLS server

#### new http2([options])
Initiate a new TLS server with the provided key and certificate
* `options`
  * `key`: [`Buffer`](https://nodejs.org/api/buffer.html) containing private key in PEM format
  * `cert`: [`Buffer`](https://nodejs.org/api/buffer.html) containing public certificate in PEM format

#### http2.listen(port)
Start the server listening for encrypted connections on `port`

#### http2.use(path, handler)
* `path`: `String` representing the url to register the  handler to
* `handler`: `Function` the request handler function that will be invoked when the provided `path` is requested

`handler` has the signature `(request, response, next)`

#### http2.use(handler)
* `handler`: `Function` the middleware function, invoked on every request

`handler` has the signature `(request, response, next)`

#### http2.get(path, handler)
* `path`: `String` representing the url to register the GET handler to
* `handler`: `Function` the request handler function that will be invoked when the provided `path` is requested using the GET method

`handler` has the signature `(request, response, next)`

#### http2.post(path, handler)
* `path`: `String` representing the url to register the POST handler to
* `handler`: `Function` the request handler function that will be invoked when the provided `path` is requested using the POST method

`handler` has the signature `(request, response, next)`

#### `next` parameter in handler methods
The `next` parameter is a `Function` with the signature `(request, response, next)` invoking the next matching request handler

### Class:Request
* `headers`: `Object` containing the different header fields in the request
* `raw_data`: [`Buffer`](https://nodejs.org/api/buffer.html) containing the raw data received from the client
* `query`: `Object` containing the GET query
* `body`: `Object` containing the query from the body

```javascript
server.get('/', (request, response, next) => {
  let method = request.headers[':method'];
  if(method == 'GET')
    console.log(request.query);
  else
    console.log(request.body);
});
```

#### new Request(headers, data)
* `headers`: `Array` of request header fields represented as an `Array` structured as `[[key, value], [key, value]...]`
* `data`: [`Buffer`](https://nodejs.org/api/buffer.html) containing the raw data from the request

### Class:Response
* `headers`: `Array` of response header fields represented as an `Array` structured as `[[key, value], [key, value]...]`
* `payload`: [`Buffer`](https://nodejs.org/api/buffer.html) containing the raw data to respond to the client
* `is_sent`: `Boolean` storing if the response is sent already (`true` if sent)
* `required_paths`: `Array` storing paths specified for server push

#### new Response()
Set up a basic Response object containing `content-type` and `content-length` headers

#### response.status(code)
* `code`: `Number` representing the status code to be sent to the client

Stores the status code in `headers`

#### response.send(data)
* `data`: [`Buffer`](https://nodejs.org/api/buffer.html) or `String` to be sent to the client

Stores the `data` in the `payload` and prevents the response to be "sent" again

#### response.sendFile(path)
* `path`: `String` holding the path to the file to transmit

Reads the file at the `path` location to `payload` and prevents the response to be "sent" again

#### response.push(path)
* `path`: `Object` structure: `{method: '', path: ''}`
Registers the path as a HTTP/2 Push so the library utilises HTTP/2 Push to serve the data. This can be registered multiple times for multiple dependecies to be pushed to the client

```javascript
server.get('/', (request, response, next) => {
  response.sendFile(__dirname + '/public/index.html');
  response.push({
    method: 'GET',
    path: '/index.css'
  });
  response.push({
    method: 'GET',
    path: '/index.js'
  });
});

server.get('/index.js', (request, response, next) => {
  response.sendFile(__dirname + '/public/index.js');
});

server.get('/index.css', (request, response, next) => {
  response.sendFile(__dirname + '/public/index.css');
});
```
