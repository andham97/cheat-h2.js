import {ConnectionError} from '../error';
import Frame from './frame';
import {FrameTypes, ErrorCodes} from '../constants';

export default class PingFrame extends Frame {

  constructor(options){
    super(FrameTypes.PING, options);
    if(!options)
      return;
    if(this.payload.length != 8)
      throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'non-8 octet frame size');
    if(this.stream_id != 0)
      throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'non-zero stream id');
  }

  get_payload(){
    if(!this.payload)
      this.payload = new Buffer(8);
    else if(this.payload.length != 8)
      this.payload = new Buffer(8);
    return super.get_payload();
  }
}
