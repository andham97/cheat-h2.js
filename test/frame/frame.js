import Frame from './frame';
import chai from 'chai';

describe('Frame', () => {
  it('should set the correct flags', () => {
    let frame = new Frame(0x0, {flags: 0x5});
    chai.expect(frame.flags).to.deep.equal({END_STREAM: true, PADDED: false});
  });
});
