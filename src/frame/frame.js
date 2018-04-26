import { FrameFlags } from '../constants';

export default class Frame {
  stream_id = -1;
  type;
  flags = 0x0;
  payload = new Buffer(0);

  constructor(type, options){
    this.type = type;
    this.flags = {...FrameFlags[this.type]};
    if(this.flags && this.flags.keys)
      delete this.flags.keys;
    Object.entries(this.flags).forEach(entry => {
      this.flags[entry[0]] = false;
    });
    if(!options){
      return;
    }
    this.stream_id = typeof options.stream_id != 'undefined' ? options.stream_id : -1;
    Object.entries(this.flags).forEach(flag => {
      this.flags[flag[0]] = (options.flags & FrameFlags[this.type][flag[0]]) != 0;
    });
    if(options.payload)
      this.payload = Buffer.concat([new Buffer(0), options.payload]);
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
console.log('heii')
let a = new Frame(0x0)
let buffer = new Buffer([0x4f, 0x61, 0x64])
let h = a.set_data(buffer)
let b = a.payload;
console.log(buffer)
console.log(a)
console.log(h)
console.log(b)
