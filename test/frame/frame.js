import Frame from '../../src/frame/frame';
import chai from 'chai';

describe('Frame', () => {
  it('should set the correct flags', () => {
    let frame = new Frame(0x0, {flags: 0x5});
    chai.expect(frame.flags).to.deep.equal({END_STREAM: true, PADDED: false});
  });

  it('should set data', () => {
    let new_frame = new Frame(0x0);
    let buffer = new Buffer([0x4f])
    let set_data = new_frame.set_data(buffer);
    chai.expect(new_frame.payload).to.deep.equal(buffer);
  });

  it('should append data', () => {
    let new_frame = new Frame(0x0);
    let buffer = new Buffer([0x4f])
    let append_data = new_frame.append_data(buffer);
    chai.expect(new_frame.payload).to.deep.equal(buffer);
  });

  it('should set stream id', () => {
    let new_frame = new Frame(0x0);
    let id = 2
    let set_stream_id = new_frame.set_stream_id(id);
    chai.expect(new_frame.stream_id).to.deep.equal(id);
  });

  it('should get payload', () => {
    let new_frame = new Frame(0x0);
    let payload = new Buffer([0x4f])
    let set_data = new_frame.set_data(payload);
    chai.expect(new_frame.get_payload()).to.deep.equal(payload);
  })
});
