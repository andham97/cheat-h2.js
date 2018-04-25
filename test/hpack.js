import Frame from '../../src/frame/frame';
import chai from 'chai';
import {hpack_methods} from '../src/hpack';

describe('encoding header request', () => {
  it('should encode a http header ', () =>{
    let num = 10;
    let prefix = 5;
    0x0a;
    chai.expect(hpack_methods.encode_integer(num,prefix)).to.deep.equal(new Buffer([0x0a]));
  })
});
