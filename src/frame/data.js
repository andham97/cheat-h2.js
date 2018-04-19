import { FrameTypes } from '../constants';
import Frame from './frame';

export default class DataFrame extends Frame {
  data;

  constructor(opts){
    super(FrameTypes.DATA, opts);
    if(this.flags.PADDED){
      let paddingLength = this.payload.readUIntBE(0, 1);
      this.data = this.payload.slice(1, this.payload.length - paddingLength);
      let padding = this.payload.slice(this.payload.length - paddingLength);
      if(Buffer.compare(padding, new Buffer(padding.length)))
        throw new Error('Padding error, non-zero padding');
    }
    else
      this.data = Buffer.concat([new Buffer(0), this.payload]);
  }
}
