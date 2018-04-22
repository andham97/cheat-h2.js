import EventEmitter from 'events';
import { StreamState, FrameTypes } from '../constants';

export default class Stream extends EventEmitter {
  id;
  state = StreamState.STREAM_IDLE;
  session;
  current_data_buffer = new Buffer(0);
  current_header_buffer = new Buffer(0);
  flag_backlog = [];

  constructor(id, sess){
    super();
    this.session = sess;
    this.id = id;
    this.on('recv_frame', this.recv_frame);
    this.on('transition_state', this.transition_state);
  }

  recv_frame(frame){
    console.log();
    console.log('Stream ID: ' + this.id);
    console.log('Frame type: ' + FrameTypes.keys[frame.type]);
    switch(this.state){
      case StreamState.STREAM_IDLE:
        this.handle_idle_frame(frame);
        break;
      case StreamState.STREAM_OPEN:
        this.handle_open_frame(frame);
        break;
    }
    this.log_flags(frame);
  }

  transition_state(new_state){
    console.log(StreamState.keys[new_state]);
    switch(this.state){
      case StreamState.STREAM_IDLE:
        if([StreamState.STREAM_OPEN, StreamState.STREAM_RESERVED_LOCAL, StreamState.STREAM_RESERVED_REMOTE].indexOf(new_state) != -1)
          this.state = new_state;
        break;
      case StreamState.STREAM_OPEN:
        if([StreamState.STREAM_CLOSED, StreamState.STREAM_HALF_CLOSED_REMOTE, StreamState.STREAM_HALF_CLOSED_LOCAL].indexOf(new_state) != -1)
          this.state = new_state;
        break;
      case StreamState.STREAM_HALF_CLOSED_REMOTE:
        if(StreamState.STREAM_CLOSED == new_state)
          this.state = new_state;
        break;
    }
  }

  handle_idle_frame(frame){
    switch(frame.type){
      case FrameTypes.HEADERS:
        this.emit('transition_state', StreamState.STREAM_OPEN);
        if(frame.flags.END_STREAM)
          this.emit('transition_state', StreamState.STREAM_CLOSED);
        this.current_header_buffer = Buffer.concat([this.current_header_buffer, frame.payload]);
    }
    //console.log('Header buffer: ' + this.current_header_buffer.toString('hex'));
    //console.log('Data buffer: ' + this.current_data_buffer.toString('hex'));
  }

  handle_open_frame(frame){
    switch(frame.type){
      case FrameTypes.CONTINUATION:
        this.current_header_buffer = Buffer.concat([this.current_header_buffer, frame.payload]);
        if(frame.flags.END_HEADERS)
          console.log(this.session.in_context.decompress(this.current_header_buffer));
        break;
      case FrameTypes.DATA:
        this.current_data_buffer = Buffer.concat([this.current_data_buffer, frame.payload]);
        break;
    }
    if(frame.flags.END_STREAM)
      this.emit('transition_state', StreamState.STREAM_HALF_CLOSED_REMOTE);
    //console.log('Header buffer: ' + this.current_header_buffer.toString('hex'));
    //console.log('Data buffer: ' + this.current_data_buffer.toString('hex'));
  }

  log_flags(frame){
    Object.entries(frame.flags).forEach((flag_pair) => {
      if(flag_pair[1])
        this.flag_backlog.push(flag_pair[0]);
    });
  }
}
