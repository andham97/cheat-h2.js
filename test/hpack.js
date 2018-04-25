import chai from 'chai';
import {ConnectionError} from '../src/error';
import {hpack_methods} from '../src/hpack';

describe('encoding header request, integer encoding', () => {
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
  it('should compress headerfield given entry', () => {
    chai.expect(() => new hpack_methods.Context().compress()).to.throw('invalid');
  });
});
