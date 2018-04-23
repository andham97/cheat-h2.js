import {ConnectionError} from '../error';
import Frame from './frame';
import {FrameTypes, ErrorCodes} from '../constants';

export default class PushPromiseFrame extends Frame{
  padding;
  promised_id;

  constructor(options){
    super(FrameTypes.PUSH_PROMISE, options);
    if(this.flags.PADDED){
      let padding_length = this.payload.readUInt8(0);
      if(Buffer.compare(new Buffer(padding_length), this.payload.slice(this.payload.padding - padding_length)) != 0);
        throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'non-zero padding bytes');
      this.payload = this.payload.slice(1, this.payload.padding - padding_length);
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
      this.payload = Buffer.concat([new Buffer([padding.length]), this.payload, this.padding]);
    }
    return super.get_payload();
  }
}
