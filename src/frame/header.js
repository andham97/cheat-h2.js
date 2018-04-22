import { FrameTypes, ErrorCodes } from '../constants';
import ConnectionError from '../error';
import Frame from './frame';

export default class HeadersFrame extends Frame{
  headers = {};
  exclusive;
  weight;
  streamDependency;
  padding;

  constructor(opitions){
    super(FrameTypes.HEADERS, opitions);
    if(this.flags.PADDED){
      let lenghtPadding = this.payload.readUInt8(0);
      if(Buffer.compare(new Buffer(lenghtPadding), this.payload.slice(this.payload.padding - lenghtPadding)) != 0);
        return; //// TODO:
      this.payload = this.payload.slice(1, this.payload.padding - lenghtPadding);
    }
    if (this.flags.PRIORITY) {
      this.exclusive = (this.payload.readUInt32BE(0)&(0x1 << 31))!= 0;
      this.weight = this.payload.readUInt8(4);
      this.streamDependency = (this.payload.readUInt32BE(0)^(0x1 << 31));
      this.payload = this.payload.slice(5);
    }
  }

  get_payload(){
    if(this.flags.PRIORITY) {
      let stream_dependency = streamDependency
      if(stream_dependency < Math.pow(2, 31))
        if(this.exclusive)
          stream_dependency |= 0x80000000;
        if(this.weight > 256)
          return new Error('');
        this.payload = Buffer.concat(new Buffer([(stream_dependency >> 24), (stream_dependency >> 16), (stream_dependency >> 8), stream_dependency, weight]), payload);
    }
    if(this.flags.PADDED){
      if(!padding){
        return new Error('this fail')
      }
      this.payload = Buffer.concat(new Buffer[padding.length], payload, padding)

    }
    return super.get_payload();
  }
}
