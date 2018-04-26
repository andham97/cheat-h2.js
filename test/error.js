import chai from 'chai';
import {ErrorCodes} from '../src/constants';
import {StreamError} from '../src/error';

describe('Error class testing', () => {
  it('Testing constructor of Stream errors', () => {
    let error = ErrorCodes.INTERNAL_ERROR;
    let msg = "invalid";
    let stream_id = 1;
    let new_stream_error = new StreamError(error, msg, stream_id);
    chai.expect(new_stream_error.stream_id).to.equal(stream_id);
  });
});
