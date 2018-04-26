import chai from 'chai';
import DataFrame from '../../src/frame/data';

describe('Dataframe', () => {
  it('should create new dataframe', () => {
    let payload = new Buffer([0x4f, 0x61, 0x64]);
    let new_dataframe = new DataFrame(payload);
    chai.expect(new_dataframe.payload).to.deep.equal(new_dataframe.get_payload());
  });

  it('should create new dataframe, with padding', () => {
    let new_dataframe = new DataFrame()
    new_dataframe.padding = 32
    chai.expect(new_dataframe.payload).to.deep.equal(new_dataframe.get_payload());
  });
});
