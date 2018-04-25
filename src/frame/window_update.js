import {ConnectionError} from '../error';
import Frame from './frame';
import { FrameTypes, ErrorCodes } from '../constants';

export default class WindowUpdateFrame extends Frame {
  window_size;

  constructor(options){
    super(FrameTypes.WINDOW_UPDATE, options);
    if(!options)
      return;
    if(this.payload.length != 4){
      throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'non-4 octet payload size');
      this.window_size = this.payload.readUInt32BE(0) ^ 0x80000000;
    }
  }

  get_payload(){
    this.payload = new Buffer([(this.window_size >> 24), (this.window_size >> 16), (this.window_size >> 8), this.window_size]);
    if(this.payload.readUInt32BE(0) > Math.pow(2, 31) - 1)
      throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'size error');
    return super.get_payload();
  }
}
