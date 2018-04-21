import EventEmitter from 'events';
import { StreamState, FrameTypes } from '../constants';

export default class Stream extends EventEmitter {
  id;
  state;
  session;

  constructor(id, sess){
    super();
    this.session = sess;
    this.id = id;
    this.state = StreamState.STREAM_IDLE;
    this.on('recv_frame', this.recvFrame);
    this.on('transition_state', this.transitionState);
  }

  recvFrame(frame){
    console.log(frame);
    switch(this.state){
      case StreamState.STREAM_IDLE:
        return this.handleIdleFrame(frame);
      case StreamState.STREAM_OPEN:
        return this.handleOpenFrame(frame);
    }
  }

  transitionState(newState){
    switch(this.state){
      case StreamState.STREAM_IDLE:
        if([StreamState.STREAM_OPEN, StreamState.STREAM_RESERVED_LOCAL, StreamState.STREAM_RESERVED_REMOTE].indexOf(newState) != -1)
          this.state = newState;
        break;
      case StreamState.STREAM_OPEN:
        if([StreamState.STREAM_CLOSED, StreamState.STREAM_HALF_CLOSED_REMOTE, StreamState.STREAM_HALF_CLOSED_LOCAL].indexOf(newState) != -1)
          this.state = newState;
        break;
      case StreamState.STREAM_HALF_CLOSED_REMOTE:
        if(StreamState.STREAM_CLOSED == newState)
          this.state = newState;
        break;
    }
  }

  handleIdleFrame(frame){
    switch(frame.type){
      case FrameTypes.HEADERS:
        this.emit('transition_state', StreamState.STREAM_OPEN);
        // TODO: update comp/decmop context

    }
  }

  handleOpenFrame(frame){

  }
}
