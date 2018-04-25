import {ConnectionError} from '../error';
import Frame from './frame';
import {FrameTypes, ErrorCodes} from '../constants';

export default class GoawayFrame extends Frame{
  last_stream_id;
  error_code;
  debug_data;

  constructor(options){
    super(FrameTypes.GOAWAY, options);
    if(!options)
      return;
    if(this.stream_id != 0)
      throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'non-zero stream id');
    this.last_stream_id = this.payload.readUInt32BE(0) & 0x7fffffff;
    this.error_code = this.payload.readUInt32BE(1);
    this.debug_data = this.payload.slice(8);
  }

  get_payload(){
    this.payload = Buffer.concat([new Buffer([
      ((this.last_stream_id >> 24) & 0x7f),
      (this.last_stream_id >> 16),
      (this.last_stream_id >> 8),
      this.last_stream_id,
      (this.error_code >> 24),
      (this.error_code >> 16),
      (this.error_code >> 8),
      this.error_code
    ]), this.debug_data]);
    if(this.payload.length < 8)
      throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'too small frame');
    if(!ErrorCodes.keys[this.error_code])
      throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'unknown error type');
    return super.get_payload();
  }
}
