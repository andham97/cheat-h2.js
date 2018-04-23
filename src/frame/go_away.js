import {ConnectionError} from '../error';
import Frame from './frame';
import {FrameTypes, ErrorCodes} from '../constants';

export default class GoawayFrame extends Frame{

  constructor(options){
    super(FrameTypes.GOAWAY, options);
  }

  get_payload(){
    if(this.payload.length != 8)
      throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'non-8 octet frame size');

    if(!ErrorCodes.keys[this.payload.readUInt32BE(1)])
      throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'unknown error type');

    return super.get_payload();
  }
}
