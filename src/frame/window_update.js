import Frame from './frame';
import { FrameTypes } from '../constants';

export default class WindowUpdateFrame extends Frame {
  constructor(options){
    super(FrameTypes.WINDOW_UPDATE, options);
  }

  get_payload(){
    console.log(this.payload);
    if(this.payload.length != 4)
      return new Error('length');
    if(this.payload.readUInt32BE(0) > Math.pow(2, 31) - 1)
      return new Error('size');
    this.payload[0] ^= 0x80000000;
    return super.get_payload();
  }
}
