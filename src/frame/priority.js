import Frame from './frame';
import {FrameTypes} from '../constants';

export default class PriorityFrame extends Frame{
  exclusive;
  stream_dependency;
  weight;

  constructor(options){
    super(FrameTypes.PRIORITY, options);
    if(this.payload.length != 5)
      return ('FRAME_SIZE_ERROR_ERROR')
    this.exclusive = (this.payload.readUInt32BE(0)&(0x1 << 31))!= 0;
    this.stream_dependency = (this.payload.readUInt32BE(0)&(0x7fffffff));
    this.weight = (this.payload.readUInt8(4));
  }

  get_payload(){
    this.payload = new Buffer(5);
    let stream_dependency = this.stream_dependency;
    if(stream_dependency < Math.pow(2, 31)){
      if(exclusive)
        stream_dependency |= 0x80000000;
      if(this.weight > 256) //KAST FEIL
        return new Error('');
      this.payload = Buffer.concat(new Buffer([(stream_dependency >> 24), (stream_dependency >> 16), (stream_dependency >> 8), stream_dependency, weight]), payload);
    } else {
      return ('KAST EN FEIL');
    }
    return super.get_payload();
  }
}
