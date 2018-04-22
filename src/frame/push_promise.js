import Frame from './frame';
import {FrameTypes} from '../constants';

export default class PushPromiseFrame extends Frame{

  constructor(options){
    super(FrameTypes.PUSH_PROMISE, options);
  }

  get_payload(){

    return super.get_payload();
  }
}
