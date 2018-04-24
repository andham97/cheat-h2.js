import {ConnectionError} from '../error';
import Frame from './frame';
import {FrameTypes, ErrorCodes} from '../constants';

export default class GoawayFrame extends Frame{
  last_stream_id;
  error_code;
  debug_data;

  constructor(options){
    super(FrameTypes.GOAWAY, options);
    this.last_stream_id = this.payload.readUInt32BE(0) ^ 0x80000000;
    this.error_code = this.payload.readUInt32BE(1);
    this.debug_data = this.payload.slice(8);
    console.log(this.debug_data.toString());
  }

  get_payload(){
    if(this.payload.length != 8)
      throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'non-8 octet frame size');

    if(!ErrorCodes.keys[this.payload.readUInt32BE(1)])
      throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'unknown error type');

    return super.get_payload();
  }
}
