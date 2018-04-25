import { FrameTypes, ErrorCodes } from '../constants';
import {ConnectionError} from '../error';
import Frame from './frame';

export default class HeadersFrame extends Frame{
  headers = {};
  exclusive;
  weight;
  stream_dependency;
  padding;

  constructor(options){
    super(FrameTypes.HEADERS, options);
    if(!options)
      return;
    if(this.stream_id == 0)
      throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'non-zero stream id');
    if(this.flags.PADDED){
      let padding_length = this.payload.readUInt8(0);
      if(Buffer.compare(new Buffer(padding_length), this.payload.slice(this.payload.length - padding_length)) != 0)
        throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'non-zero padding bytes');
      this.payload = this.payload.slice(1, this.payload.length - padding_length);
    }
    if (this.flags.PRIORITY) {
      this.exclusive = (this.payload.readUInt32BE(0)&(0x1 << 31))!= 0;
      this.weight = this.payload.readUInt8(4);
      this.stream_dependency = (this.payload.readUInt32BE(0)^(0x1 << 31));
      this.payload = this.payload.slice(5);
    }
  }

  get_payload(){
    if(this.flags.PRIORITY) {
      let stream_dependency = this.stream_dependency;
      if(stream_dependency < Math.pow(2, 31))
        if(this.exclusive)
          stream_dependency |= 0x80000000;
        if(this.weight > 256)
          throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'weight extends 256');
        this.payload = Buffer.concat(new Buffer([(stream_dependency >> 24), (stream_dependency >> 16), (stream_dependency >> 8), stream_dependency, this.weight]), this.payload);
    }
    if(this.flags.PADDED){
      if(!this.padding){
          throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'padding missing');
      }
      this.payload = Buffer.concat(new Buffer([padding.length]), this.payload, this.padding);
    }
    return super.get_payload();
  }
}
