import { FrameFlags } from '../constants';

export default class Frame {
  stream_id = -1;
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
    this.stream_id = typeof opts.stream_id != 'undefined' ? opts.stream_id : -1;
    Object.entries(this.flags).forEach(flag => {
      this.flags[flag[0]] = (opts.flags & FrameFlags[this.type][flag[0]]) != 0;
    });
    if(opts.payload)
      this.payload = Buffer.concat([new Buffer(0), opts.payload]);
    else
      this.payload = new Buffer(0);
  }

  set_data(data){
    this.payload = Buffer.concat([new Buffer(0), data]);
  }

  append_data(data){
    this.payload = Buffer.concat([this.payload, data]);
  }

  set_stream_id(id){
    this.stream_id = id;
  }

  get_payload(){
    return this.payload;
  }
}
