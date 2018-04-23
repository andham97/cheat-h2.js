import {ConnectionError} from '../error';
import Frame from './frame';
import {FrameTypes, ErrorCodes} from '../constants';

export default class PushPromiseFrame extends Frame{
  padding;
  promised_id;

  constructor(options){
    super(FrameTypes.PUSH_PROMISE, opts);
    if(this.flags.PADDED){
      let paddingLength = this.payload.readUInt8(0);
      if(Buffer.compare(new Buffer(paddingLength), this.payload.slice(this.payload.padding - paddingLenght)) != 0);
        throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'non-zero padding bytes');
      this.payload = this.payload.slice(1, this.payload.padding - paddingLenght);
    }
    this.promised_id = (this.payload.readUInt32BE(0) & 0x7fffffff);
    this.payload = this.payload.slice(5);
  }

  get_payload(){
    if(this.payload.length < 4)
      throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'frame size under 4');
    if(this.flags.PADDED){
      if(this.payload.length < 5){
        throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'frame size under 5');
      }
      this.payload = Buffer.concat([new Buffer([padding.length]), payload, padding])
    }
    return super.get_payload();
  }
}
