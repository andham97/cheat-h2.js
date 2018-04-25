import chai from 'chai';
import {ConnectionError} from '../src/error';
import {hpack_methods, Entry} from '../src/hpack';
import h2 from '../'

describe('creating new entry', () => {
  it('should return invalid arrgument, name not string', () => {
    let name = 123;
    let value = "GET";
    chai.expect(() => new hpack_methods.Entry(name, value)).to.throw('invalid');
  });
});

describe('testing methods attached to header table', () => {
  it('should return invalid arrgument', () => {
    let entry = [':method', 'GET'];
    chai.expect(() => new hpack_methods.HeaderTable().add(entry)).to.throw('invalid');
  });

  it('should add new entry to header table', () => {
    let entry = new Entry(':method', 'GET');
    chai.expect(new hpack_methods.HeaderTable().add(entry)).to.deep.equal();
  });

  it('should return invalid arrgument, getting index', () => {
    let index = '1';
    chai.expect(() => new hpack_methods.HeaderTable().get(index)).to.throw('invalid');
  });

  it('should return invalid arrgument, index smaller than 1', () => {
    let index = 0;
    chai.expect(() => new hpack_methods.HeaderTable().get(index)).to.throw('invalid');
  });
/*
  it('should find entry, given name and value', () => {
    let name = ':method';
    let value = 'GET';
    chai.expect(new hpack_methods.HeaderTable().find(name, value)).to.equal();
  });
  */
  it('should set new max size', () => {
    let new_size = 400;
    chai.expect(new hpack_methods.HeaderTable().set_max_size(new_size)).to.equal();
  });

  it('should return invalid arrgument, new size not number', () => {
    let new_size = '400';
    chai.expect(() => new hpack_methods.HeaderTable().set_max_size(new_size)).to.throw('invalid');
  });
  it('should set new max size, same as max_szi', () => {
    let new_size = 4096;
    chai.expect(new hpack_methods.HeaderTable().set_max_size(new_size)).to.equal();
  });

});

describe('encoding header request, integer encoding', () => {
  it('should return invalid arrgument, prefix bigger than 8', () => {
    let num = 10;
    let prefix = 9;
    chai.expect(() => hpack_methods.encode_integer(num, prefix)).to.throw('invalid');
  });

  it('should encode a http header, low test number ', () => {
    let num = 10;
    let prefix = 5;
    chai.expect(hpack_methods.encode_integer(num,prefix)).to.deep.equal(new Buffer([0x0a]));
  });

  it('should encode a http header, high test number', () => {
    let prefix = 5;
    let num = 1337;
    chai.expect(hpack_methods.encode_integer(num,prefix)).to.deep.equal(new Buffer([0x1f, 0x9a, 0x0a]));
  });
});


describe('encoding header request, string encoding', () => {
  it('should return invalid arrgument, wrong arrgument', () => {
    let sBuffer = (0x00);
    let huffman = true;
    chai.expect(() => hpack_methods.encode_string(sBuffer, huffman)).to.throw('invalid')
  })
  it('should encode a http header, shot string with huffman', () => {
    let sBuffer = new Buffer([0x4f]);
    let huffman = true;
    chai.expect(hpack_methods.encode_string(sBuffer, huffman)).to.deep.equal(new Buffer([0x81, 0xd5]));
  });

  it('should encode a http header, long string with huffman', () => {
    let sBuffer = new Buffer([0x4f, 0x64, 0x61, 0x20, 0x6f, 0x67, 0x20, 0x68, 0x61, 0x6d, 0x6d, 0x65, 0x72, 0x20, 0x65, 0x72, 0x20, 0x62, 0x65, 0x73, 0x74, 0x21]);
    let huffman = true;
    chai.expect(hpack_methods.encode_string(sBuffer, huffman)).to.deep.equal(new Buffer([0x91, 0xd5, 0x20, 0xd4, 0x3c, 0xca, 0x4e, 0x3a, 0x69, 0x2d, 0x8a, 0x16, 0xc5, 0x23, 0x2a, 0x13, 0xfc, 0x7f]));
  });

  it('should encode a http header, short string without huffman', () => {
    let sBuffer = new Buffer([0x4f]);
    let huffman = false;
    chai.expect(hpack_methods.encode_string(sBuffer, huffman)).to.deep.equal(new Buffer([0x01, 0x4f]));
  });

  it('should encode a http header, long string without huffman', () => {
    let sBuffer = new Buffer([0x4f, 0x64, 0x61, 0x20, 0x6f, 0x67, 0x20, 0x68, 0x61, 0x6d, 0x6d, 0x65, 0x72, 0x20, 0x65, 0x72, 0x20, 0x62, 0x65, 0x73, 0x74, 0x21])
    let huffman = false;
    chai.expect(hpack_methods.encode_string(sBuffer, huffman)).to.deep.equal(new Buffer([0x16, 0x4f, 0x64, 0x61, 0x20, 0x6f, 0x67, 0x20, 0x68, 0x61, 0x6d, 0x6d, 0x65, 0x72, 0x20, 0x65, 0x72, 0x20, 0x62, 0x65, 0x73, 0x74, 0x21]));
  });
});


describe('decoding header request, integer decoding', () => {
  it('should return invalid arrgument, wrong arrgument', () => {
    let buffer = (0x00);
    let prefix = 5;
    chai.expect(() => hpack_methods.decode_integer(buffer, prefix)).to.throw('invalid');
  });

  it('should return invalid arrgument, prefix is higher then 8', () => {
    let buffer = new Buffer([0x0a]);
    buffer.current_byte = 0;
    let prefix = 9;
    chai.expect(() => hpack_methods.decode_integer(buffer,prefix)).to.throw('invalid');
  })

  it('should decode a http header, low test number', () => {
    let buffer = new Buffer([0x0a]);
    buffer.current_byte = 0;
    let prefix = 5;
    chai.expect(hpack_methods.decode_integer(buffer, prefix)).to.deep.equal(10);
  });

  it('should decode a http header, high test number', () => {
    let buffer = new Buffer([0x1f, 0x9a, 0x0a]);
    buffer.current_byte = 0;
    let prefix = 5;
    chai.expect(hpack_methods.decode_integer(buffer, prefix)).to.deep.equal(1337);
  });
});


describe('decoding header request, string decoding', () => {
  it('should return invalid arrgument, wrong arrgument', () => {
    let buffer = (0x00);
    chai.expect(() => hpack_methods.decode_string(buffer)).to.throw('invalid');
  });

  it('should return invalid arrgument, invalid string representation', () => {
    let buffer = new Buffer([0x01]);
    buffer.current_byte = 10;
    chai.expect(() => hpack_methods.decode_string(buffer)).to.throw('invalid string representation');
  });

  it('should decode a http header, short test string with huffman', () => {
    let buffer = new Buffer([0x01, 0x4f]);
    buffer.current_byte = 0;
    chai.expect(hpack_methods.decode_string(buffer)).to.equal('O');
  });

  it('should decode a http header, long test string with huffman', () => {
    let buffer = new Buffer([0x16, 0x4f, 0x64, 0x61, 0x20, 0x6f, 0x67, 0x20, 0x68, 0x61, 0x6d, 0x6d, 0x65, 0x72, 0x20, 0x65, 0x72, 0x20, 0x62, 0x65, 0x73, 0x74, 0x21]);
    buffer.current_byte = 0;
    chai.expect(hpack_methods.decode_string(buffer)).to.equal('Oda og hammer er best!');
  });
});

describe('encoding header request, huffman encoding', () => {
  it('should return invalid arrgument, wrong arrgument', () => {
    let buffer = (0x00);
    chai.expect(() => hpack_methods.huffman_encode(buffer)).to.throw('invalid');
  });

  it('should encode a http header using huffman, short buffer example', () => {
    let buffer = new Buffer([0x4f, 0x64, 0x61]);
    chai.expect(hpack_methods.huffman_encode(buffer)).to.deep.equal(new Buffer([0xd5, 0x20, 0xff]))
  });

  it('should encode a http header using huffman, long buffer example', () => {
    let buffer = new Buffer([0x4f, 0x64, 0x61, 0x20, 0x6f, 0x67, 0x20, 0x68, 0x61, 0x6d, 0x6d, 0x65, 0x72, 0x20, 0x65, 0x72, 0x20, 0x62, 0x65, 0x73, 0x74, 0x21]);
    chai.expect(hpack_methods.huffman_encode(buffer)).to.deep.equal(new Buffer([0xd5, 0x20, 0xd4, 0x3c, 0xca, 0x4e, 0x3a, 0x69, 0x2d, 0x8a, 0x16, 0xc5, 0x23, 0x2a, 0x13, 0xfc, 0x7f]))
  });
});


describe('decoding header request, huffman decoding', () =>{
  it('should return invalid argument, using wrong arrgument', () =>{
    let buffer = (0x82);
    chai.expect(() => hpack_methods.huffman_decode(buffer)).to.throw('invalid');
  });

  it('should decode a http header using huffman, short buffer example', () => {
    let buffer = new Buffer([0xd5, 0x20, 0xff]);
    chai.expect(hpack_methods.huffman_decode(buffer)).to.deep.equal(new Buffer([0x4f, 0x64, 0x61]));
  });

  it('should decode a http header using huffman, long buffer example', () => {
    let buffer = new Buffer([0xd5, 0x20, 0xd4, 0x3c, 0xca, 0x4e, 0x3a, 0x69, 0x2d, 0x8a, 0x16, 0xc5, 0x23, 0x2a, 0x13, 0xfc, 0x7f]);
    chai.expect(hpack_methods.huffman_decode(buffer)).to.deep.equal(new Buffer([0x4f, 0x64, 0x61, 0x20, 0x6f, 0x67, 0x20, 0x68, 0x61, 0x6d, 0x6d, 0x65, 0x72, 0x20, 0x65, 0x72, 0x20, 0x62, 0x65, 0x73, 0x74, 0x21]));
  });
});


describe('compress function', () => {
  it('should return as invalid, INTERNAL_ERROR, on empty entry', () => {
    chai.expect(() => new hpack_methods.Context().compress()).to.throw('invalid');
  });

  it('should compress headerfield given entry, empty array entry', () => {
    chai.expect(new hpack_methods.Context().compress([])).to.deep.equal(new Buffer([]));
  });

  it('should return as invalid, header != Entry', () =>{
    let entry = [':path', 'method:', '1010', 'hello'];
    chai.expect(() => new hpack_methods.Context().compress(entry)).to.throw('INTERNAL_ERROR: invalied arrgument');
  });

  it('should compress entry, array with just one entry', () => {
    let entry = [new Entry(':method', 'GET')];
    chai.expect(new hpack_methods.Context().compress(entry)).to.deep.equal(new Buffer([0x82]));
  });

  it('should compress entry, array with several enties', () => {
    let entries = [new Entry(':method', 'GET'), new Entry(':authority', ''), new Entry(':path', '/index.html'), new Entry('accept-charset', ''), new Entry('allow', '')];
    chai.expect(new hpack_methods.Context().compress(entries)).to.deep.equal(new Buffer([0x82, 0x81, 0x85, 0x8f, 0x96]))
  });
});


describe('decompress function', () => {
  it('should return with invalid argument', () => {
    let buffer = (0x82);
    chai.expect(() => new hpack_methods.Context().decompress(buffer)).to.throw('invalid');
  })
  it('should decompress entry, array with one entry', () => {
    let buffer = new Buffer([0x82]);
    chai.expect(new hpack_methods.Context().decompress(buffer)).to.deep.equal([new Entry(':method', 'GET')]);
  });

  it('should decomrpess entries, array with several entries', () => {
    let buffer = new Buffer([0x82, 0x81, 0x85, 0x8f, 0x96]);
    chai.expect(new hpack_methods.Context().decompress(buffer)).to.deep.equal([new Entry(':method', 'GET'), new Entry(':authority', ''), new Entry(':path', '/index.html'), new Entry('accept-charset', ''), new Entry('allow', '')]);
  });
});
