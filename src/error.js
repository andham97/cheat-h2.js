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
    console.log('1')
    super(ErrorCodes.keys[error] + (typeof msg != 'undefined' ? ': ' + msg : ''));
    console.log('2')
    Error.captureStackTrace(this, StreamError);
    console.log('3')
    this.error_code = error;
    console.log('4')
    this.stream_id = stream_id || -1;
  }
}
/*
let error = ErrorCodes.INTERNAL_ERROR;
let msg = "invalid";
let stream_id = 1;
let new_stream_error = new StreamError(error, msg, stream_id)
console.log(new_stream_error)
*/
