import {ErrorCodes} from './constants';
import {ConnectionError} from './error';

let static_table = [
  [':authority', ''],
  [':method', 'GET'],
  [':method', 'POST'],
  [':path', '/'],
  [':path', '/index.html'],
  [':scheme', 'http'],
  [':scheme', 'https'],
  [':status', '200'],
  [':status', '204'],
  [':status', '206'],
  [':status', '304'],
  [':status', '400'],
  [':status', '404'],
  [':status', '500'],
  ['accept-charset', ''],
  ['accept-encoding', 'gzip, deflate'],
  ['accept-language', ''],
  ['accept-ranges', ''],
  ['accept', ''],
  ['access-control-allow-origin', ''],
  ['age', ''],
  ['allow', ''],
  ['authorization', ''],
  ['cache-control', ''],
  ['content-disposition', ''],
  ['content-encoding', ''],
  ['content-language', ''],
  ['content-length', ''],
  ['content-location', ''],
  ['content-range', ''],
  ['content-type', ''],
  ['cookie', ''],
  ['date', ''],
  ['etag', ''],
  ['expect', ''],
  ['expires', ''],
  ['from', ''],
  ['host', ''],
  ['if-match', ''],
  ['if-modified-since', ''],
  ['if-none-match', ''],
  ['if-range', ''],
  ['if-unmodified-since', ''],
  ['last-modified', ''],
  ['link', ''],
  ['location', ''],
  ['max-forwards', ''],
  ['proxy-authenticate', ''],
  ['proxy-authorization', ''],
  ['range', ''],
  ['referer', ''],
  ['refresh', ''],
  ['retry-after', ''],
  ['server', ''],
  ['set-cookie', ''],
  ['strict-transport-security', ''],
  ['transfer-encoding', ''],
  ['user-agent', ''],
  ['vary', ''],
  ['via', ''],
  ['www-authenticate', '']
];

const huffman_table = [
  { code: 0x1ff8,     length: 13 },
  { code: 0x7fffd8,   length: 23 },
  { code: 0xfffffe2,  length: 28 },
  { code: 0xfffffe3,  length: 28 },
  { code: 0xfffffe4,  length: 28 },
  { code: 0xfffffe5,  length: 28 },
  { code: 0xfffffe6,  length: 28 },
  { code: 0xfffffe7,  length: 28 },
  { code: 0xfffffe8,  length: 28 },
  { code: 0xffffea,   length: 24 },
  { code: 0x3ffffffc, length: 30 },
  { code: 0xfffffe9,  length: 28 },
  { code: 0xfffffea,  length: 28 },
  { code: 0x3ffffffd, length: 30 },
  { code: 0xfffffeb,  length: 28 },
  { code: 0xfffffec,  length: 28 },
  { code: 0xfffffed,  length: 28 },
  { code: 0xfffffee,  length: 28 },
  { code: 0xfffffef,  length: 28 },
  { code: 0xffffff0,  length: 28 },
  { code: 0xffffff1,  length: 28 },
  { code: 0xffffff2,  length: 28 },
  { code: 0x3ffffffe, length: 30 },
  { code: 0xffffff3,  length: 28 },
  { code: 0xffffff4,  length: 28 },
  { code: 0xffffff5,  length: 28 },
  { code: 0xffffff6,  length: 28 },
  { code: 0xffffff7,  length: 28 },
  { code: 0xffffff8,  length: 28 },
  { code: 0xffffff9,  length: 28 },
  { code: 0xffffffa,  length: 28 },
  { code: 0xffffffb,  length: 28 },
  { code: 0x14,       length: 6  },
  { code: 0x3f8,      length: 10 },
  { code: 0x3f9,      length: 10 },
  { code: 0xffa,      length: 12 },
  { code: 0x1ff9,     length: 13 },
  { code: 0x15,       length: 6  },
  { code: 0xf8,       length: 8  },
  { code: 0x7fa,      length: 11 },
  { code: 0x3fa,      length: 10 },
  { code: 0x3fb,      length: 10 },
  { code: 0xf9,       length: 8  },
  { code: 0x7fb,      length: 11 },
  { code: 0xfa,       length: 8  },
  { code: 0x16,       length: 6  },
  { code: 0x17,       length: 6  },
  { code: 0x18,       length: 6  },
  { code: 0x0,        length: 5  },
  { code: 0x1,        length: 5  },
  { code: 0x2,        length: 5  },
  { code: 0x19,       length: 6  },
  { code: 0x1a,       length: 6  },
  { code: 0x1b,       length: 6  },
  { code: 0x1c,       length: 6  },
  { code: 0x1d,       length: 6  },
  { code: 0x1e,       length: 6  },
  { code: 0x1f,       length: 6  },
  { code: 0x5c,       length: 7  },
  { code: 0xfb,       length: 8  },
  { code: 0x7ffc,     length: 15 },
  { code: 0x20,       length: 6  },
  { code: 0xffb,      length: 12 },
  { code: 0x3fc,      length: 10 },
  { code: 0x1ffa,     length: 13 },
  { code: 0x21,       length: 6  },
  { code: 0x5d,       length: 7  },
  { code: 0x5e,       length: 7  },
  { code: 0x5f,       length: 7  },
  { code: 0x60,       length: 7  },
  { code: 0x61,       length: 7  },
  { code: 0x62,       length: 7  },
  { code: 0x63,       length: 7  },
  { code: 0x64,       length: 7  },
  { code: 0x65,       length: 7  },
  { code: 0x66,       length: 7  },
  { code: 0x67,       length: 7  },
  { code: 0x68,       length: 7  },
  { code: 0x69,       length: 7  },
  { code: 0x6a,       length: 7  },
  { code: 0x6b,       length: 7  },
  { code: 0x6c,       length: 7  },
  { code: 0x6d,       length: 7  },
  { code: 0x6e,       length: 7  },
  { code: 0x6f,       length: 7  },
  { code: 0x70,       length: 7  },
  { code: 0x71,       length: 7  },
  { code: 0x72,       length: 7  },
  { code: 0xfc,       length: 8  },
  { code: 0x73,       length: 7  },
  { code: 0xfd,       length: 8  },
  { code: 0x1ffb,     length: 13 },
  { code: 0x7fff0,    length: 19 },
  { code: 0x1ffc,     length: 13 },
  { code: 0x3ffc,     length: 14 },
  { code: 0x22,       length: 6  },
  { code: 0x7ffd,     length: 15 },
  { code: 0x3,        length: 5  },
  { code: 0x23,       length: 6  },
  { code: 0x4,        length: 5  },
  { code: 0x24,       length: 6  },
  { code: 0x5,        length: 5  },
  { code: 0x25,       length: 6  },
  { code: 0x26,       length: 6  },
  { code: 0x27,       length: 6  },
  { code: 0x6,        length: 5  },
  { code: 0x74,       length: 7  },
  { code: 0x75,       length: 7  },
  { code: 0x28,       length: 6  },
  { code: 0x29,       length: 6  },
  { code: 0x2a,       length: 6  },
  { code: 0x7,        length: 5  },
  { code: 0x2b,       length: 6  },
  { code: 0x76,       length: 7  },
  { code: 0x2c,       length: 6  },
  { code: 0x8,        length: 5  },
  { code: 0x9,        length: 5  },
  { code: 0x2d,       length: 6  },
  { code: 0x77,       length: 7  },
  { code: 0x78,       length: 7  },
  { code: 0x79,       length: 7  },
  { code: 0x7a,       length: 7  },
  { code: 0x7b,       length: 7  },
  { code: 0x7ffe,     length: 15 },
  { code: 0x7fc,      length: 11 },
  { code: 0x3ffd,     length: 14 },
  { code: 0x1ffd,     length: 13 },
  { code: 0xffffffc,  length: 28 },
  { code: 0xfffe6,    length: 20 },
  { code: 0x3fffd2,   length: 22 },
  { code: 0xfffe7,    length: 20 },
  { code: 0xfffe8,    length: 20 },
  { code: 0x3fffd3,   length: 22 },
  { code: 0x3fffd4,   length: 22 },
  { code: 0x3fffd5,   length: 22 },
  { code: 0x7fffd9,   length: 23 },
  { code: 0x3fffd6,   length: 22 },
  { code: 0x7fffda,   length: 23 },
  { code: 0x7fffdb,   length: 23 },
  { code: 0x7fffdc,   length: 23 },
  { code: 0x7fffdd,   length: 23 },
  { code: 0x7fffde,   length: 23 },
  { code: 0xffffeb,   length: 24 },
  { code: 0x7fffdf,   length: 23 },
  { code: 0xffffec,   length: 24 },
  { code: 0xffffed,   length: 24 },
  { code: 0x3fffd7,   length: 22 },
  { code: 0x7fffe0,   length: 23 },
  { code: 0xffffee,   length: 24 },
  { code: 0x7fffe1,   length: 23 },
  { code: 0x7fffe2,   length: 23 },
  { code: 0x7fffe3,   length: 23 },
  { code: 0x7fffe4,   length: 23 },
  { code: 0x1fffdc,   length: 21 },
  { code: 0x3fffd8,   length: 22 },
  { code: 0x7fffe5,   length: 23 },
  { code: 0x3fffd9,   length: 22 },
  { code: 0x7fffe6,   length: 23 },
  { code: 0x7fffe7,   length: 23 },
  { code: 0xffffef,   length: 24 },
  { code: 0x3fffda,   length: 22 },
  { code: 0x1fffdd,   length: 21 },
  { code: 0xfffe9,    length: 20 },
  { code: 0x3fffdb,   length: 22 },
  { code: 0x3fffdc,   length: 22 },
  { code: 0x7fffe8,   length: 23 },
  { code: 0x7fffe9,   length: 23 },
  { code: 0x1fffde,   length: 21 },
  { code: 0x7fffea,   length: 23 },
  { code: 0x3fffdd,   length: 22 },
  { code: 0x3fffde,   length: 22 },
  { code: 0xfffff0,   length: 24 },
  { code: 0x1fffdf,   length: 21 },
  { code: 0x3fffdf,   length: 22 },
  { code: 0x7fffeb,   length: 23 },
  { code: 0x7fffec,   length: 23 },
  { code: 0x1fffe0,   length: 21 },
  { code: 0x1fffe1,   length: 21 },
  { code: 0x3fffe0,   length: 22 },
  { code: 0x1fffe2,   length: 21 },
  { code: 0x7fffed,   length: 23 },
  { code: 0x3fffe1,   length: 22 },
  { code: 0x7fffee,   length: 23 },
  { code: 0x7fffef,   length: 23 },
  { code: 0xfffea,    length: 20 },
  { code: 0x3fffe2,   length: 22 },
  { code: 0x3fffe3,   length: 22 },
  { code: 0x3fffe4,   length: 22 },
  { code: 0x7ffff0,   length: 23 },
  { code: 0x3fffe5,   length: 22 },
  { code: 0x3fffe6,   length: 22 },
  { code: 0x7ffff1,   length: 23 },
  { code: 0x3ffffe0,  length: 26 },
  { code: 0x3ffffe1,  length: 26 },
  { code: 0xfffeb,    length: 20 },
  { code: 0x7fff1,    length: 19 },
  { code: 0x3fffe7,   length: 22 },
  { code: 0x7ffff2,   length: 23 },
  { code: 0x3fffe8,   length: 22 },
  { code: 0x1ffffec,  length: 25 },
  { code: 0x3ffffe2,  length: 26 },
  { code: 0x3ffffe3,  length: 26 },
  { code: 0x3ffffe4,  length: 26 },
  { code: 0x7ffffde,  length: 27 },
  { code: 0x7ffffdf,  length: 27 },
  { code: 0x3ffffe5,  length: 26 },
  { code: 0xfffff1,   length: 24 },
  { code: 0x1ffffed,  length: 25 },
  { code: 0x7fff2,    length: 19 },
  { code: 0x1fffe3,   length: 21 },
  { code: 0x3ffffe6,  length: 26 },
  { code: 0x7ffffe0,  length: 27 },
  { code: 0x7ffffe1,  length: 27 },
  { code: 0x3ffffe7,  length: 26 },
  { code: 0x7ffffe2,  length: 27 },
  { code: 0xfffff2,   length: 24 },
  { code: 0x1fffe4,   length: 21 },
  { code: 0x1fffe5,   length: 21 },
  { code: 0x3ffffe8,  length: 26 },
  { code: 0x3ffffe9,  length: 26 },
  { code: 0xffffffd,  length: 28 },
  { code: 0x7ffffe3,  length: 27 },
  { code: 0x7ffffe4,  length: 27 },
  { code: 0x7ffffe5,  length: 27 },
  { code: 0xfffec,    length: 20 },
  { code: 0xfffff3,   length: 24 },
  { code: 0xfffed,    length: 20 },
  { code: 0x1fffe6,   length: 21 },
  { code: 0x3fffe9,   length: 22 },
  { code: 0x1fffe7,   length: 21 },
  { code: 0x1fffe8,   length: 21 },
  { code: 0x7ffff3,   length: 23 },
  { code: 0x3fffea,   length: 22 },
  { code: 0x3fffeb,   length: 22 },
  { code: 0x1ffffee,  length: 25 },
  { code: 0x1ffffef,  length: 25 },
  { code: 0xfffff4,   length: 24 },
  { code: 0xfffff5,   length: 24 },
  { code: 0x3ffffea,  length: 26 },
  { code: 0x7ffff4,   length: 23 },
  { code: 0x3ffffeb,  length: 26 },
  { code: 0x7ffffe6,  length: 27 },
  { code: 0x3ffffec,  length: 26 },
  { code: 0x3ffffed,  length: 26 },
  { code: 0x7ffffe7,  length: 27 },
  { code: 0x7ffffe8,  length: 27 },
  { code: 0x7ffffe9,  length: 27 },
  { code: 0x7ffffea,  length: 27 },
  { code: 0x7ffffeb,  length: 27 },
  { code: 0xffffffe,  length: 28 },
  { code: 0x7ffffec,  length: 27 },
  { code: 0x7ffffed,  length: 27 },
  { code: 0x7ffffee,  length: 27 },
  { code: 0x7ffffef,  length: 27 },
  { code: 0x7fffff0,  length: 27 },
  { code: 0x3ffffee,  length: 26 },
  { code: 0x3fffffff, length: 30 }
];

const header_field_type = {
  INDEXED: 0,
  LITERAL_INC: 1,
  LITERAL: 2,
  LITERAL_NEVER: 3,
  HEADER_TABLE_SIZE: 4
};

const header_field_type_spec = [
  {
    prefix: 7,
    mask: 0x80
  },
  {
    prefix: 6,
    mask: 0x40
  },
  {
    prefix: 4,
    mask: 0x00
  },
  {
    prefix: 4,
    mask: 0x10
  },
  {
    prefix: 5,
    mask: 0x20
  }
];

const literal_headers = {
  /*'content-length': true,
  'content-MD5': true,
  'forwarded': true,
  'referer': true*/
};

const literal_headers_never_indexed = {
  /*'set-cookie': true,
  'authorization': true,
  'from': true,
  'proxy-authorization': true,
  'etag': true,
  'location': true*/
};

const read_byte = (buffer) => {
  return buffer[buffer.current_byte++];
}

const read_bytes = (buffer, len) => {
  let bytes = buffer.slice(buffer.current_byte, buffer.current_byte + len);
  buffer.current_byte += len;
  return bytes;
}

const huffman_generate_tree = () => {
  let root = [];
  for(let i = 0; i < huffman_table.length; i++){
    let node = root;
    let huffman = huffman_table[i];
    for(let j = huffman.length-1; j >= 0; j--){
      let next = (huffman.code & (0x1 << j)) != 0 ? 1 : 0;
      if(j == 0){
        node[next] = i;
        continue;
      }
      if(!node[next])
        node[next] = [];
      node = node[next ? 1 : 0];
    }
  }
  return root;
}

const huffman_decode = (buffer) => {
  if(!(buffer instanceof Buffer))
    throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalid argument');
  let node = huffman_root;
  let ret = [];
  for(let i = 0; i <buffer.length; i++){
    let byte = buffer[i];
    for(let j = 7; j >= 0; j--){
      if((byte & (0x1 << j)) != 0)
        node = node[1];
      else
        node = node[0];
      if(typeof node == 'number'){
        ret.push(node);
        node = huffman_root;
      }
    }
  }
  return new Buffer(ret);
}

const decode_integer = (buffer, prefix) => {
  if(!(buffer instanceof Buffer))
    throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalid argument');
  if(prefix > 8 || prefix < 1)
    throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalid prefix size');
  let limit = Math.pow(2, prefix) - 1;
  let i = read_byte(buffer) & limit;
  if(i < limit)
    return i;
  let b, m = 0;
  do {
    b = read_byte(buffer);
    if(b == undefined)
      throw new ConnectionError(ErrorCodes.COMPRESSION_ERROR, 'invalid integer representation');
    i += (b & 0x7f) * Math.pow(2, m);
    m += 7;
  } while((b & 0x80) != 0);
  return i;
}

const decode_string = (buffer) => {
  if(!(buffer instanceof Buffer))
    throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalid argument');
  let sByte = buffer[buffer.current_byte];
  let length = decode_integer(buffer, 7);
  if(buffer.length < buffer.current_byte + length)
    throw new ConnectionError(ErrorCodes.COMPRESSION_ERROR, 'invalid string representation');
  if((sByte & 0x80) != 0)
    return huffman_decode(read_bytes(buffer, length)).toString();
  else
    return read_bytes(buffer, length).toString();
}


const huffman_encode = (buffer) => {
  if(!(buffer instanceof Buffer))
    throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalid argument');
  let result = [];
  let bitIndex = 7;
  let curByte = 0;

  for(let i = 0; i < buffer.length; i++){
    let huffman = huffman_table[buffer[i]];
    let code = huffman.code;
    let len = huffman.length;
    for(let i = len-1; i >= 0; i--){
      let bit = (code & (0x1 << i));
      if(bit != 0)
        curByte |= (0x1 << bitIndex);
      bitIndex--;
      if(bitIndex < 0){
        result.push(curByte);
        curByte = 0;
        bitIndex = 7;
      }
    }
  }
  if(bitIndex != 7){
    let s = huffman_table[256].length - (bitIndex + 1);
    curByte += (huffman_table[256].code >> s);
    result.push(curByte);
  }
  return new Buffer(result);
}

const encode_integer = (num, prefix) => {
  if(prefix > 8 || prefix < 1)
    throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalid prefix size');
  let limit = Math.pow(2, prefix) - 1;
  if(num < limit)
    return new Buffer([num]);
  let octs = [limit];
  num -= limit;
  while(num >= 0x80){
    octs.push((num % 0x80) | 0x80);
    num >>= 7;
  }
  octs.push(num);
  return new Buffer(octs);
}

const encode_string = (sBuffer, huffman) => {
  if(!(sBuffer instanceof Buffer))
    throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalid argument');
  if(huffman){
    let hBuffer = huffman_encode(sBuffer);
    let len = encode_integer(hBuffer.length, 7);
    len[0] |= 0x80;
    return Buffer.concat([len, hBuffer]);
  }
  else {
    let len = encode_integer(sBuffer.length, 7);
    len[0] &= 0x7f;
    return Buffer.concat([len, sBuffer]);
  }
}

const huffman_root = huffman_generate_tree();

class Entry {
  name;
  value;
  size;

  constructor(name, value){
    if(!(typeof name == 'string'))
      throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalid argument');
    this.name = name.toLowerCase();
    this.value = value.toString();
    this.size = this.name.length + this.value.length + 32;
  }
}

class HeaderTable {
  entries;
  max_size;
  size;

  constructor(options){
    if(!options)
      options = {};
    this.max_size = options.HEADER_TABLE_SIZE || 4096;
    this.entries = [];
    this.size = 0;
  }

  add(entry){
    if(!(entry instanceof Entry))
      throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalid argument');
    if(entry.size > this.max_size){
      this.size = 0;
      this.entries = [];
      return;
    }
    while((this.size + entry.size) > this.max_size){
      this.size -= this.entries[this.entries.length - 1].size;
      this.entries.splice(this.entries.length - 1, 1);
    }
    this.entries = [entry].concat(this.entries);
    this.size += entry.size;
  }

  get(index){
    if(typeof index != 'number')
      throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalid argument');
    if(index < 1 || index > static_table.length + this.entries.length)
      throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalid argument');
    if(index < static_table.length)
      return static_table[index - 1];
    else
      return this.entries[index - static_table.length - 1];
  }

  find(name, value){
    let index = 0;
    for(let i = 0; i < static_table.length; i++){
      if(static_table[i].name == name){
        if(static_table[i].value == value)
          return {
            index: i + 1,
            exact: true
          }
        else
          index = i + 1;
      }
    }
    for(let i = 0; i < this.entries.length; i++){
      if(this.entries[i].name == name){
        if(this.entries[i].value == value)
          return {
            index: i + static_table.length + 1,
            exact: true
          }
        else
          index = i + static_table.length + 1;
      }
    }
    return {
      index: index,
      exact: false
    };
  }

  set_max_size(new_size){
    if(typeof new_size != 'number')
      throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalid argument');
    new_size = Math.min(new_size, 4096);
    if(this.max_size == new_size)
      return;
    while(this.size > new_size){
      this.size -= this.entries[this.entries.length - 1].size;
      this.entries.splice(this.entries.length - 1, 1);
    }
    this.max_size = new_size;
  }
}

export default class Context {
  huffman;
  header_table;

  constructor(options){
    if(!options)
      options = {};
    this.huffman = options.huffman || false;
    this.header_table = new HeaderTable();
  }

  set_max_table_size(size){
    this.header_table.set_max_size(size);
  }

  compress(headers){
    if(!headers || !(headers instanceof Array))
      throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalid arrgument');
    let buffer = new Buffer(0);
    for(let i = 0; i < headers.length; i++){
      let header = headers[i];
      if(!(header instanceof Entry))
        throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalied arrgument');
      let table_lookup = this.header_table.find(header.name, header.value);
      if(table_lookup.exact){
        let header_field_indexed_buffer = encode_integer(table_lookup.index, header_field_type_spec[header_field_type.INDEXED].prefix);
        header_field_indexed_buffer[0] |= header_field_type_spec[header_field_type.INDEXED].mask;
        buffer = Buffer.concat([buffer, header_field_indexed_buffer]);
      }
      else {
        if(table_lookup.index != 0){
          if(literal_headers_never_indexed[header.name]){
            let header_field_literal_never_index_buffer = encode_integer(table_lookup.index, header_field_type_spec[header_field_type.LITERAL_NEVER].prefix);
            header_field_literal_never_index_buffer[0] |= header_field_type_spec[header_field_type.LITERAL_NEVER].mask;
            let header_field_literal_never_value_buffer = encode_string(new Buffer(header.value), true);
            buffer = Buffer.concat([buffer, header_field_literal_never_index_buffer, header_field_literal_never_value_buffer]);
          }
          else if(literal_headers[header.name]){
            let header_field_literal_index_buffer = encode_integer(table_lookup.index, header_field_type_spec[header_field_type.LITERAL].prefix);
            header_field_literal_index_buffer[0] |= header_field_type_spec[header_field_type.LITERAL].mask;
            let header_field_literal_value_buffer = encode_string(new Buffer(header.value), true);
            buffer = Buffer.concat([buffer, header_field_literal_index_buffer, header_field_literal_value_buffer]);
          }
          else {
            let header_field_literal_inc_index_buffer = encode_integer(table_lookup.index, header_field_type_spec[header_field_type.LITERAL_INC].prefix);
            header_field_literal_inc_index_buffer[0] |= header_field_type_spec[header_field_type.LITERAL_INC].mask;
            let header_field_literal_inc_value_buffer = encode_string(new Buffer(header.value), true);
            buffer = Buffer.concat([buffer, header_field_literal_inc_index_buffer, header_field_literal_inc_value_buffer]);
            this.header_table.add(header);
          }
        }
        else {
          if(literal_headers_never_indexed[header.name]){
            let header_field_literal_never_index_buffer = new Buffer(1);
            header_field_literal_never_index_buffer[0] |= header_field_type_spec[header_field_type.LITERAL_NEVER].mask;
            let header_field_literal_never_name_buffer = encode_string(new Buffer(header.name), true);
            let header_field_literal_never_value_buffer = encode_string(new Buffer(header.value), true);
            buffer = Buffer.concat([buffer, header_field_literal_never_index_buffer, header_field_literal_never_name_buffer, header_field_literal_never_value_buffer]);
          }
          else if(literal_headers[header.name]){
            let header_field_literal_index_buffer = new Buffer(1);
            header_field_literal_index_buffer[0] |= header_field_type_spec[header_field_type.LITERAL].mask;
            let header_field_literal_name_buffer = encode_string(new Buffer(header.name), true);
            let header_field_literal_value_buffer = encode_string(new Buffer(header.value), true);
            buffer = Buffer.concat([buffer, header_field_literal_index_buffer, header_field_literal_name_buffer, header_field_literal_value_buffer]);
          }
          else {
            let header_field_literal_inc_index_buffer = new Buffer(1);
            header_field_literal_inc_index_buffer[0] |= header_field_type_spec[header_field_type.LITERAL_INC].mask;
            let header_field_literal_inc_name_buffer = encode_string(new Buffer(header.name), true);
            let header_field_literal_inc_value_buffer = encode_string(new Buffer(header.value), true);
            buffer = Buffer.concat([buffer, header_field_literal_inc_index_buffer, header_field_literal_inc_name_buffer, header_field_literal_inc_value_buffer]);
            this.header_table.add(header);
          }
        }
      }
    }
    return buffer;
  }

  decompress(buffer){
    if(!(buffer instanceof Buffer))
      throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalid argument');
    let headers = [];
    buffer.current_byte = 0;
    while(buffer.current_byte < buffer.length){
      let fByte = buffer[buffer.current_byte];
      let type = -1;
      for(let i = 0; i < header_field_type_spec.length; i++){
        if(((fByte >> header_field_type_spec[i].prefix) ^ (header_field_type_spec[i].mask >> header_field_type_spec[i].prefix)) == 0){
          type = i;
          break;
        }
      }
      switch(type) {
        case header_field_type.INDEXED:
          let index = decode_integer(buffer, 7);
          let header = this.header_table.get(index);
          headers.push(header);
          break;
        case header_field_type.LITERAL_INC:
          if((fByte & 0x3f) != 0){
            let index = decode_integer(buffer, 6);
            let header_field = this.header_table.get(index);
            let value = decode_string(buffer);
            let entry = new Entry(header_field.name, value);
            headers.push(entry);
            this.header_table.add(entry);
          }
          else {
            buffer.current_byte++;
            let name = decode_string(buffer);
            let value = decode_string(buffer);
            let entry = new Entry(name, value);
            headers.push(entry);
            this.header_table.add(entry);
          }
          break;
        case header_field_type.LITERAL_NEVER:
        case header_field_type.LITERAL:
          if((fByte & 0xf) != 0){
            let index = decode_integer(buffer, 4);
            let header_field = this.header_table.get(index);
            let value = decode_string(buffer);
            headers.push(new Entry(header_field.name, value));
          }
          else {
            buffer.current_byte++;
            let name = decode_string(buffer);
            let value = decode_string(buffer);
            headers.push(new Entry(name, value));
          }
          break;
        case header_field_type.HEADER_TABLE_SIZE:
          let new_max_header_table_size = decode_integer(buffer, 5);
          this.header_table.set_max_size(new_max_header_table_size);
          break;
        default:
          console.log('COMPRESSION ERROR');
          console.log(buffer.current_byte);
          console.log(buffer[buffer.current_byte].toString(16));
          throw new ConnectionError(ErrorCodes.COMPRESSION_ERROR, 'unknown compression bits');
      }
    }
    return headers;
  }
}

export {Entry};

export const hpack_methods = {
  huffman_decode: huffman_decode,
  decode_integer: decode_integer,
  decode_string: decode_string,
  huffman_encode: huffman_encode,
  encode_integer: encode_integer,
  encode_string: encode_string,
  'HeaderTable': HeaderTable,
  'Context': Context,
  'Entry': Entry
}

for(let i = 0; i < static_table.length; i++){
  static_table[i] = new Entry(static_table[i][0], static_table[i][1]);
}
/**
let b = new Context()
let entry = [new Entry(':method', 'GET'), new Entry(':authority', ''), new Entry(':path', '/index.html'), new Entry('accept-charset', ''), new Entry('allow', '')]
console.log(b.compress(entry));

let buffer = new Buffer([0x82, 0x81, 0x85, 0x8f, 0x96])
console.log(b.decompress(buffer));
*/



let a = new Context()
let buffer = new Buffer([0x40]);
buffer = Buffer.concat([buffer, encode_string(new Buffer([0x4f, 0x64, 0x61]), true), encode_string(new Buffer([0x4f]), true)]);
buffer.current_byte = 0;
console.log(a.decompress(buffer));
//const testBuffer = new Buffer([0x82, 0x84, 0x87, 0x41, 0x8a, 0xa0, 0xe4, 0x1d, 0x13, 0x9d, 0x9, 0xb8, 0xf0, 0x0, 0xf, 0x7a, 0x88, 0x25, 0xb6, 0x50, 0xc3, 0xab, 0xb6, 0xd2, 0xe0, 0x53, 0x3, 0x2a, 0x2f, 0x2a]);
