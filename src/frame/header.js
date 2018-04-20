import { FrameTypes, ErrorCodes } from '../constants';
import ConnectionError from '../error';
import Frame from './frame';

export default class HeadersFrame extends Frame{

constructor(opts){
  super(FrameTypes.HEADERS, opts);
  if(this.flags.PADDED){
    let lenghtPadding = this.payload.readUIntBE8(0);
    if(Buffer.compare(new Buffer(lenghtPadding), this.payload.slice(this.payload.padding - lenghtPadding)) != 0)
      return; //// TODO:
    this.payload = this.payload.slice(1, this.payload.padding - lenghtPadding)
    } else if (this.flags.PRIORITY) {

    } else {

    }
  }
}
