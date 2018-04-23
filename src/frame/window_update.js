import {ConnectionError} from '../error';
import Frame from './frame';
import { FrameTypes, ErrorCodes } from '../constants';

export default class WindowUpdateFrame extends Frame {
  constructor(options){
    super(FrameTypes.WINDOW_UPDATE, options);
  }

  get_payload(){
    if(this.payload.length != 4)
      throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'non-4 octet frame size');
    if(this.payload.readUInt32BE(0) > Math.pow(2, 31) - 1)
      throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'size error');
    this.payload[0] ^= 0x80000000;
    return super.get_payload();
  }
}
