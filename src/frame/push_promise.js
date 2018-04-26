import {ConnectionError} from '../error';
import Frame from './frame';
import {FrameTypes, ErrorCodes} from '../constants';

export default class PushPromiseFrame extends Frame{
  padding_length;
  promised_id;

  constructor(options){
    super(FrameTypes.PUSH_PROMISE, options);
    if(!options)
      return;
    if(this.stream_id == 0)
      throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'stream id = 0');
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
    console.log(this);
    if(this.flags.PADDED)
      this.payload = Buffer.concat([new Buffer([this.padding_length]),
      new Buffer([(this.promised_id >> 24), (this.promised_id >> 16), (this.promised_id >> 8), this.promised_id]),
      this.payload, new Buffer(this.padding_length)]);
    else
      this.payload = Buffer.concat([new Buffer([(this.promised_id >> 24), (this.promised_id >> 16), (this.promised_id >> 8), this.promised_id]), this.payload]);
    return super.get_payload();
  }
}
