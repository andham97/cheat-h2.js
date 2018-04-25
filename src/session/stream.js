import EventEmitter from 'events';
import {StreamState} from '../constants';

export default class Stream extends EventEmitter {
  stream_id;
  stream_state = StreamState.STREAM_IDLE;
  session;
  stream_dependency = 0;
  weight = -1;
  exclusive = false;

  constructor(id, session){
    super();
    this.stream_id = id;
    this.session = session;
  }
}
