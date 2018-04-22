import Frame from './frame';
import {FrameTypes, ErrorCodes} from '../constants';

export default class GoawayFrame extends Frame{

  constructor(options){
    super(FrameTypes.GOAWAY, options);
  }

  get_payload(){
    if(this.payload.length != 8)
      return ('FRAME_SIZE_ERROR');

    if(!ErrorCodes.keys[this.payload.readUInt32BE(1)])
      return ('INTERNAL_ERROR');

    return super.get_payload();
  }
}
