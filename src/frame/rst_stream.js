import {ConnectionError} from '../error';
import Frame from './frame';
import {FrameTypes, ErrorCodes} from '../constants';

export default class RSTStreamFrame extends Frame{
  error_code;

  constructor(options){
    super(FrameTypes.RST_STREAM, options);
    if(!options)
      return;
    if(this.stream_id == 0)
      throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'stream id = 0');
    if(this.payload.length != 4)
      throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'non-4 octet frame size');
    if(!ErrorCodes.keys[this.payload.readUInt32BE(0)])
      throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'unknown error code');
  }

  get_payload(){
    if(this.stream_id == 0)
      throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'stream id = 0');
    this.payload = new Buffer([(this.error_code >> 24), (this.error_code >> 16), (this.error_code >> 8), this.error_code]);
    return super.get_payload();
  }
}
