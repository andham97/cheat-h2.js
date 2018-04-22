import EventEmitter from 'events';
import { StreamState, FrameTypes } from '../constants';

export default class IStream extends EventEmitter {
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
    this.on('recieve_frame', this.recieve_frame);
    this.on('transition_state', this.transition_state);
  }

  handle_request(request){
    let method = request.headers[':method'];
    let path = request.headers[':path'];
    let handlers = this.session.get_handlers(method, path);
    let next_handler = this.gen_handler_chain(request, response, handlers);
    next_handler();
  }

  generate_handler_chain(req, res, handlers, i) {
    if(i === undefined)
      i = 0;
    return () => {
      if(i < handlers.length - 1)
        handlers[i](req, res, this.generate_handler_chain(req, res, handlers, i + 1));
      else
        handlers[i](req, res, ()=>{});
    }
  }

  recieve_frame(frame){
    console.log();
    console.log('Stream ID: ' + this.id);
    console.log('Frame type: ' + FrameTypes.keys[frame.type]);
    this.delegate_frame(frame);
    this.log_flags(frame);
  }

  handle_idle_frame(frame){
    console.log(frame);
    switch(frame.type){
      case FrameTypes.HEADERS:
        this.emit('transition_state', StreamState.STREAM_OPEN);
        this.delegate_frame(frame);
        break;
      case FrameTypes.PUSH_PROMISE:
        this.emit('transition_state', StreamState.STREAM_RESERVED_LOCAL);
        this.delegate_frame(frame);
        break;
    }
  }

  handle_reserved_local_frame(frame){
    switch(frame.type){
      case FrameTypes.RST_STREAM:
        this.emit('transition_state', StreamState.STREAM_CLOSED);
        this.delegate_frame(frame);
        break;
    }
  }

  handle_open_frame(frame){
    switch(frame.type){
      case FrameTypes.HEADERS:
        this.current_header_buffer = Buffer.concat([frame.payload]);
        if(frame.flags.END_HEADERS)
          console.log(this.session.in_context.decompress(this.current_header_buffer));
        break;
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
  }

  handle_reserved_remote_frame(frame){

  }

  handle_half_closed_remote_frame(frame){

  }

  handle_closed_frame(frame){

  }

  handle_half_closed_local_frame(frame){

  }

  transition_state(new_state){
    console.log(StreamState.keys[new_state]);
    switch(this.state){
      case StreamState.STREAM_IDLE:
        if([StreamState.STREAM_OPEN, StreamState.STREAM_RESERVED_LOCAL, StreamState.STREAM_RESERVED_REMOTE].indexOf(new_state) != -1)
          this.state = new_state;
        break;
      case StreamState.STREAM_RESERVED_LOCAL:
        if([StreamState.STREAM_CLOSED, StreamState.STREAM_HALF_CLOSED_REMOTE].indexOf(new_state) != -1)
          this.state = new_state;
        break;
      case StreamState.STREAM_OPEN:
        if([StreamState.STREAM_CLOSED, StreamState.STREAM_HALF_CLOSED_REMOTE, StreamState.STREAM_HALF_CLOSED_LOCAL].indexOf(new_state) != -1)
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

  delegate_frame(frame){
    switch(this.state){
      case StreamState.STREAM_IDLE:
        this.handle_idle_frame(frame);
        break;
      case StreamState.STREAM_RESERVED_LOCAL:
        this.handle_reserved_local_frame(frame);
        break;
      case StreamState.STREAM_OPEN:
        this.handle_open_frame(frame);
        break;
      case StreamState.STREAM_RESERVED_REMOTE:
        this.handle_reserved_remote_frame(frame);
        break;
      case StreamState.STREAM_HALF_CLOSED_REMOTE:
        this.handle_half_closed_remote_frame(frame);
        break;
      case StreamState.STREAM_CLOSED:
        this.handle_closed_frame(frame);
        break;
      case StreamState.STREAM_HALF_CLOSED_LOCAL:
        this.handle_half_closed_local_frame(frame);
        break;
    }
  }

  log_flags(frame){
    Object.entries(frame.flags).forEach((flag_pair) => {
      if(flag_pair[1])
        this.flag_backlog.push(flag_pair[0]);
    });
  }
}
