import Frame from './frame';
import {FrameTypes} from '../constants';

export default class PingFrame extends Frame {
  constructor(options){
    super(options);
  }

  get_payload(){
    this.payload = new Buffer(8);
    return super.get_payload();
  }
}
