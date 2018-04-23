import Frame from './frame';
import {FrameTypes} from '../constants';

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
    if(this.flags.PADDED){
      if(this.payload.length < 5){
        return ('FRAME_SIZE_ERROR')
      }
      this.payload = Buffer.concat([new Buffer([padding.length]), payload, padding])
    }
    return super.get_payload();
  }
}
