import chai from 'chai';
import PushPromiseFrame from '../../src/frame/push_promise';

describe('Push promise frame', () => {
  it('should create push promise frame', () => {
    let id = 1;
    let payload = new Buffer(8)
    let options = {id, payload}
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
});
