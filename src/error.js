import { ErrorCodes } from './constants';

export class ConnectionError extends Error {
  error_code;
  stream_id;
  type = 0x1;

  constructor(error, msg, stream_id){
    super(ErrorCodes.keys[error] + (typeof msg != 'undefined' ? ': ' + msg : ''));
    Error.captureStackTrace(this, ConnectionError);
    this.error_code = error;
    this.stream_id = stream_id || -1;
  }
}

export class StreamError extends Error {
  error_code;
  stream_id;
  type = 0x2;

  constructor(error, msg, stream_id){
    super(ErrorCodes.keys[error] + (typeof msg != 'undefined' ? ': ' + msg : ''));
    Error.captureStackTrace(this, StreamError);
    this.error_code = error;
    this.stream_id = stream_id || -1;
  }
}
