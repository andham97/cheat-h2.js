import { ErrorCodes } from './constants';

export class ConnectionError extends Error {
  error_code;
  
  constructor(error, msg){
    super(ErrorCodes.keys[error] + (typeof msg != 'undefined' ? ': ' + msg : ''));
    Error.captureStackTrace(this, ConnectionError);
    this.error_code = error;
  }
}

export class StreamError extends Error {
  error_code;

  constructor(error, msg){
    super(ErrorCodes.keys[error] + (typeof msg != 'undefined' ? ': ' + msg : ''));
    Error.captureStackTrace(this, StreamError);
    this.error_code = error;
  }
}
