import EventEmitter from 'events';
import { StreamState, FrameTypes } from '../constants';
import { Entry } from '../hpack';
import Request from './request';
import Response from './response';
import HeadersFrame from '../frame/header';
import DataFrame from '../frame/data';
import RSTStreamFrame from '../frame/rst_stream';

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

  recieve_frame(frame){
    console.log();
    console.log('Stream ID: ' + this.id);
    console.log('Frame type: ' + FrameTypes.keys[frame.type]);
    console.log(frame);
    this.delegate_frame(frame);
    this.log_flags(frame);
  }

  handle_idle_frame(frame){
    switch(frame.type){
      case FrameTypes.HEADERS:
        this.emit('transition_state', StreamState.STREAM_OPEN);
        this.delegate_frame(frame);
        break;
      case FrameTypes.PUSH_PROMISE:
        this.emit('transition_state', StreamState.STREAM_RESERVED_LOCAL);
        this.delegate_frame(frame);
        break;
      case FrameTypes.PRIORITY:
        break;
      default:
        throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'invalid frame recieved');
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
        if(frame.flags.END_STREAM){
          this.emit('transition_state', StreamState.STREAM_HALF_CLOSED_REMOTE);
          this.handle_request();
        }
        break;
      case FrameTypes.CONTINUATION:
        this.current_header_buffer = Buffer.concat([this.current_header_buffer, frame.payload]);
        if(frame.flags.END_STREAM){
          this.emit('transition_state', StreamState.STREAM_HALF_CLOSED_REMOTE);
          this.handle_request();
        }
        break;
      case FrameTypes.DATA:
        this.current_data_buffer = Buffer.concat([this.current_data_buffer, frame.payload]);
        if(frame.flags.END_STREAM){
          this.emit('transition_state', StreamState.STREAM_HALF_CLOSED_REMOTE);
          this.handle_request();
        }
        break;
    }
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

  handle_request(){
    let headers = this.session.in_context.decompress(this.current_header_buffer);
    this.session.update_headers(headers);
    let request = new Request(this.session.headers, this.current_data_buffer);
    let response = new Response(this.session.headers);
    let method = request.headers[':method'];
    let path = request.headers[':path'];
    let handlers = this.session.manager.get_handlers(method, path);
    let next_handler = this.generate_handler_chain(request, response, handlers);
    if(next_handler)
      next_handler();
    let frames = this.convert_response(response);
    frames.forEach(frame => {
      this.send_frame(frame);
    });
  }

  generate_handler_chain(req, res, handlers, i) {
    if(i === undefined)
      i = 0;
    if(!handlers || handlers.length == 0)
      return;
    return () => {
      if(i < handlers.length - 1)
        handlers[i](req, res, this.generate_handler_chain(req, res, handlers, i + 1));
      else
        handlers[i](req, res, ()=>{});
    }
  }

  log_flags(frame){
    Object.entries(frame.flags).forEach((flag_pair) => {
      if(flag_pair[1])
        this.flag_backlog.push(flag_pair[0]);
    });
  }

  convert_response(response){
    let hf = new HeadersFrame();
    let df = new DataFrame();
    hf.sid = this.id;
    hf.flags.END_HEADERS = true;
    df.sid = this.id;
    df.flags.END_STREAM = true;
    response.headers['content-length'] = response.payload.length;
    let headers = Object.entries(response.headers).map(e => {
      return new Entry(e[0], e[1]);
    });
    headers = headers.sort((a, b) => {
      if(a.name[0] == ':' && b.name[0] != ':')
        return -1;
      else if(a.name[0] != ':' && b.name[0] == ':')
        return 1;
      return 0;
    });
    df.payload = response.payload;
    hf.payload = this.session.out_context.compress(headers);
    return [hf, df];
  }

  send_frame(frame){
    switch(this.state){
      case StreamState.STREAM_HALF_CLOSED_REMOTE:
        if(frame.flags.END_STREAM)
          this.emit('transition_state', StreamState.STREAM_CLOSED);
        else if(frame instanceof RSTStreamFrame)
          this.emit('transition_state', StreamState.STREAM_CLOSED);
    }
    this.session.send_frame(frame);
  }
}
