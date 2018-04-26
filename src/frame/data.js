import { FrameTypes, ErrorCodes } from '../constants';
import {ConnectionError} from '../error';
import Frame from './frame';

export default class DataFrame extends Frame {
  padding;

  constructor(options){
    super(FrameTypes.DATA, options);
    if(!options)
      return;
    if(this.flags.PADDED){
      if(this.payload < 1){
        throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'missing bytes for padding control');
      }
      let padding_length = this.payload.readUInt8(0);
      this.data = this.payload.slice(1, this.payload.length - padding_length);
      let padding = this.payload.slice(this.payload.length - padding_length);
      if(Buffer.compare(padding, new Buffer(padding.length)))
        throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'non-zero padding bytes');
    }
    if(this.padding >= (this.payload.length - 1))
      throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'payload is all padding or padding is set to be greater than entire payload');
  }

  get_payload(){
    if(this.flags.PADDED){
      this.payload = Buffer.concat([new Buffer([this.padding]), this.payload, new Buffer(this.padding)]);
    }
    return super.get_payload();
  }
}
