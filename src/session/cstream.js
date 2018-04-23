import IStream from './istream';
import {FrameTypes, ErrorCodes} from '../constants';
import {ConnectionError} from '../error';

export default class ControlStream extends IStream {
  constructor(id, sess){
    super(id, sess);
  }

  recieve_frame(frame){
    console.log();
    console.log('Control Stream ID: ' + this.stream_id);
    console.log('Frame type: ' + FrameTypes.keys[frame.type]);
    console.log(frame);
    switch(frame.type){
      case FrameTypes.SETTINGS:
      case FrameFlags.WINDOW_UPDATE:
      default:
        throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'invalid frame recieved: ' + FrameTypes.keys[frame.type]);
    }
  }
}
