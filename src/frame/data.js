import { FrameTypes, ErrorCodes } from '../constants';
import ConnectionError from '../error';
import Frame from './frame';

export default class DataFrame extends Frame {
  padding;

  constructor(opts){
    super(FrameTypes.DATA, opts);
    if(this.flags.PADDED){
      if(this.payload < 1){
        throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'missing byte for padding control');
      }
      let paddingLength = this.payload.readUInt8(0);
      this.data = this.payload.slice(1, this.payload.length - paddingLength);
      let padding = this.payload.slice(this.payload.length - paddingLength);
      if(Buffer.compare(padding, new Buffer(padding.length)))
        throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'non-zero padding bytes');
    }
    if(padding >= (this.payload.length - 1))
      return ('FRAME_SIZE_ERROR');
  }

  get_payload(){
    return super.get_payload();
  }
}
