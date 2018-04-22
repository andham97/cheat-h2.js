import Frame from './frame';
import {FrameTypes} from '../constants';

export default class PingFrame extends Frame {

  constructor(options){
    super(FrameTypes.PING, options);
    if(this.payload.length != 8){
      return('FRAME_SIZE_ERROR')
    }
  }

  get_payload(){
    this.payload = new Buffer(8);
    return super.get_payload();
  }
}
