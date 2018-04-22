import Frame from './frame';

export default class WindowUpdateFrame extends Frame {
  constructor(options){
    super(options);
  }

  get_payload(){
    if(this.payload.length != 4)
      return new Error('');
    if((this.payload.readUInt32BE(0) & 0x7fffffff) < 1)
      return new Error('');
    this.payload[0] ^= 0x80000000;
    return super.get_payload();
  }
}
