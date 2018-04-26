import chai from 'chai';
import PriorityFrame from '../../src/frame/priority';

describe('Priority frame', () => {
  it('should return invalid', () => {
    let stream_id = 0;
    let payload = new Buffer(5);
    let options = {stream_id,payload}
    //let new_frame = new PriorityFrame(stream_id);
    chai.expect(() => new PriorityFrame(options)).to.throw('PROTOCOL_ERROR: stream id = 0')
  });

  it('should return invalid', () => {
    let stream_id = 1;
    let payload = new Buffer(4);
    let options = {stream_id,payload}
    //let new_frame = new PriorityFrame(stream_id);
    chai.expect(() => new PriorityFrame(options)).to.throw('FRAME_SIZE_ERROR: wrong payload length:')
  });

  it('should return FRAME_SIZE_ERROR', () => {
    let weight = 5
    let new_frame = new PriorityFrame();
    new_frame.weight = weight;
    chai.expect(() => new_frame.get_payload()).to.throw('FRAME_SIZE_ERROR')
  });

  it('should return new buffer', () => {
    let new_frame = new PriorityFrame();
    let weight = 5;
    new_frame.weight = weight;
    new_frame.stream_dependency = 5;
    chai.expect(new_frame.get_payload()).to.deep.equal(new Buffer([0x00, 0x00, 0x00, 0x05, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00]));
  });

  it('should return FRAME_SIZE_ERROR, weight over 256', () => {
    let weight = 260
    let new_frame = new PriorityFrame();
    new_frame.weight = weight;
    new_frame.stream_dependency = 5;
    chai.expect(() => new_frame.get_payload()).to.throw('FRAME_SIZE_ERROR')
  });

  it('should return new buffer', () => {
    let payload = new Buffer(5)
    let stream_id = 1;
    let options = {payload, stream_id}
    chai.expect(new PriorityFrame(options).get_payload()).to.deep.equal(new Buffer(10));
  });

  it('should return new buffer', () => {
    let new_frame = new PriorityFrame();
    let weight = 5;
    new_frame.weight = weight;
    new_frame.stream_dependency = 5;
    new_frame.exclusive = true
    chai.expect(new_frame.get_payload()).to.deep.equal(new Buffer([0x80, 0x00, 0x00, 0x05, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00]));
  });
});
