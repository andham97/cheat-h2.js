import { FrameFlags } from '../constants';

export default class Frame {
  sid = -1;
  type;
  flags = 0x0;
  payload = new Buffer(0);

  constructor(type, opts){
    this.type = type;
    if(!opts)
      return;
    this.sid = opts.sid;
    this.flags = {...FrameFlags[this.type]};
    Object.entries(this.flags).forEach(flag => {
      this.flags[flag[0]] = (opts.flags & flag[1]) != 0;
    });
    this.payload = Buffer.concat([new Buffer(0), opts.payload]);
  }

  setData(data){
    this.payload = Buffer.concat([new Buffer(0), data]);
  }

  appendData(data){
    this.payload = Buffer.concat([this.payload, data]);
  }

  setStreamID(id){
    this.sid = id;
  }
}
