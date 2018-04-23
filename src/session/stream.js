import EventEmitter from 'events';
import {StreamState} from '../constants';

export default class Stream extends EventEmitter {
  stream_id;
  stream_state = StreamState.IDLE;
  session;

  constructor(id, session){
    super();
    this.stream_id = id;
    this.session = session;
  }
}
