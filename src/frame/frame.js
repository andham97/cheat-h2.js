import { FrameFlags } from '../constants';

export default class Frame {
  sid = -1;
  type;
  flags = 0x0;
  payload = new Buffer(0);

  constructor(type, opts){
    this.type = type;
    this.flags = {...FrameFlags[this.type]};
    if(this.flags && this.flags.keys)
      delete this.flags.keys;
    Object.entries(this.flags).forEach(entry => {
      this.flags[entry[0]] = false;
    });
    if(!opts){
      return;
    }
    this.sid = typeof opts.sid != 'undefined' ? opts.sid : -1;
    Object.entries(this.flags).forEach(flag => {
      this.flags[flag[0]] = (opts.flags & FrameFlags[this.type][flag[0]]) != 0;
    });
    if(opts.payload)
      this.payload = Buffer.concat([new Buffer(0), opts.payload]);
    else
      this.payload = new Buffer(0);
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

  getPayload(){
    return this.payload;
  }
}
