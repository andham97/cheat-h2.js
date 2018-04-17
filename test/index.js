import Index from '..';
import chai from 'chai';
describe('Simple test', () => {
  it('should return 100', () => {
    chai.expect(Index()).to.equal(100);
  });
});
