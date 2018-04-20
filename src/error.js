import { ErrorCodes } from './constants';

export default class ConnectionError extends Error {
  errorCode;
  constructor(error, msg){
    super(ErrorCodes.keys[error] + (typeof msg != 'undefined' ? ': ' + msg : ''));
    Error.captureStackTrace(this, ConnectionError);
    this.errorCode = error;
  }
}
