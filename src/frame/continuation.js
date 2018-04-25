import Frame from './frame';
import {FrameTypes, ErrorCodes} from '../constants';
import {ConnectionError} from '../error';

export default class ContinuationFrame extends Frame{

  constructor(options){
    super(FrameTypes.CONTINUATION, options);
    if(!options)
      return;
    if(this.stream_id == 0)
      throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'stream id = 0');
  }

  get_payload(){
    return super.get_payload();
  }
}
