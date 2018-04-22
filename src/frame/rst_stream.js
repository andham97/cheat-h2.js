import Frame from './frame';
import {FrameTypes} from '../constants';

export default class RST_StreamFrame extends Frame{
  error_code;

  constructor(opitions){
    super(opitions);
    if(this.payload.length != 4){
      return 'FRAME_SIZE_ERROR';
    }
  }

  get_payload(){
    this.payload = new Buffer([(error_code >> 24), (error_code >> 16), (error_code >> 8), error_code]);
    return super.get_payload();
  }
}
