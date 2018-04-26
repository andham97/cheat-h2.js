import chai from 'chai';
import PushPromiseFrame from '../../src/frame/push_promise';

describe('Push promise frame', () => {
  it('should create push promise frame', () => {
    let stream_id = 1;
    let payload = new Buffer(8)
    let options = {stream_id, payload}
    let new_frame = new PushPromiseFrame(options);
    chai.expect(new_frame.get_payload()).to.deep.equal(new Buffer(7));
  });

  it('should return new buffer containing 00 00 00 00', () => {
    let new_frame = new PushPromiseFrame
    chai.expect(new_frame.get_payload()).to.deep.equal(new Buffer(4));
  });

  it('should throw connection error, id = 0', () => {
    let stream_id = 0
    let payload = new Buffer(5)
    let options = {stream_id, payload}
    chai.expect(() => new PushPromiseFrame(options)).to.throw('PROTOCOL_ERROR')
  });

  it('should return buffer ', () => {
    let stream_id = 1;
    let payload = new Buffer(8)
    let options = {stream_id, payload}
    let new_frame = new PushPromiseFrame(options)
    new_frame.payload = new Buffer(8);
    new_frame.flags.PADDED = true;
    new_frame.padding_length = 2;
    chai.expect(new_frame.get_payload()).to.deep.equal(new Buffer([0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
  });

  it('should return buffer', () => {
      let new_frame = new PushPromiseFrame()
      new_frame.flags.PADDED = true;
      new_frame.padding_length = 2;
      new_frame.payload = new Buffer(8);
      chai.expect(new_frame.payload).to.deep.equal(new Buffer(8))
  });


});
