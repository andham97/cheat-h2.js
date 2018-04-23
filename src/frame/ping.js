import {ConnectionError} from '../error';
import Frame from './frame';
import {FrameTypes, ErrorCodes} from '../constants';

export default class PingFrame extends Frame {

  constructor(options){
    super(FrameTypes.PING, options);
    if(this.payload.length != 8){
        throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'non-8 octet frame size');
    }
  }

  get_payload(){
    this.payload = new Buffer(8);
    return super.get_payload();
  }
}
