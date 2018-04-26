import chai from 'chai';
import PingFrame from '../../src/frame/ping';

describe('PingFrame', () => {
  it('should return frame size error', () => {
    let new_frame = new PingFrame();
    chai.expect(new_frame.get_payload()).to.deep.equal(new Buffer(8));
  });

  it('should return frame size error', () => {
    let payload = new Buffer([0x4f, 0x61, 0x64, 0x00, 0x61]);
    chai.expect(() => new PingFrame(payload)).to.throw('FRAME_SIZE_ERROR: non-8 octet frame size');
  });

  it('should return invalid, setting strem id = 1', () => {
    let stream_id = 1;
    let payload = new Buffer(8)
    let options = {stream_id, payload}
    chai.expect(() => new PingFrame(options)).to.throw('non-zero stream id');
  });

  it('should create new buffer with 8 byte as payload', () => {
    let new_frame = new PingFrame()
    new_frame.payload = undefined
    chai.expect(new_frame.get_payload()).to.deep.equal(new Buffer(8));
  })
});
