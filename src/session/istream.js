import Stream from './stream';
import { StreamState, FrameTypes, ErrorCodes } from '../constants';
import { Entry } from '../hpack';
import Request from './request';
import Response from './response';
import HeadersFrame from '../frame/header';
import DataFrame from '../frame/data';
import PushPromiseFrame from '../frame/push_promise';
import RSTStreamFrame from '../frame/rst_stream';
import {ConnectionError, StreamError} from '../error';

export default class IStream extends Stream {
  current_data_buffer = new Buffer(0);
  current_header_buffer = new Buffer(0);
  flag_backlog = [];

  constructor(id, session){
    super(id, session);
    this.on('recieve_frame', this.recieve_frame);
    this.on('transition_state', this.transition_state);
  }

  recieve_frame(frame){
    console.log();
    console.log('Stream ID: ' + this.stream_id);
    console.log('Frame type: ' + FrameTypes.keys[frame.type]);
    console.log(frame);
    this.delegate_frame(frame);
    this.log_flags(frame);
  }

  handle_idle_frame(frame){
    switch(frame.type){
      case FrameTypes.HEADERS:
        this.emit('transition_state', StreamState.STREAM_OPEN);
        this.current_header_buffer = Buffer.concat([frame.payload]);
        if(frame.flags.END_STREAM){
          this.emit('transition_state', StreamState.STREAM_HALF_CLOSED_REMOTE);
        }
        break;
      case FrameTypes.PUSH_PROMISE:
        this.emit('transition_state', StreamState.STREAM_RESERVED_LOCAL);
        break;
      case FrameTypes.PRIORITY:
        break;
      default:
        throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'invalid frame recieved: ' + FrameTypes.keys[frame.type], this.stream_id);
    }
  }

  handle_reserved_local_frame(frame){
    switch(frame.type){
      case FrameTypes.RST_STREAM:
        this.emit('transition_state', StreamState.STREAM_CLOSED);
        this.delegate_frame(frame);
        break;
      case FrameTypes.PRIORITY:
      case FrameTypes.WINDOW_UPDATE:
        break;
      default:
        throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'invalid frame recieved: ' + FrameTypes.keys[frame.type], this.stream_id);
    }
  }

  handle_open_frame(frame){
    if(!this.check_flag('END_HEADERS') && frame.type != FrameTypes.CONTINUATION)
      throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'not finished sending headers');
    switch(frame.type){
      case FrameTypes.CONTINUATION:
        if(this.check_flag('END_HEADERS'))
          throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'recieved continuation frame after END_HEADERS flag set');
        this.current_header_buffer = Buffer.concat([this.current_header_buffer, frame.payload]);
        if(frame.flags.END_STREAM)
          this.emit('transition_state', StreamState.STREAM_HALF_CLOSED_REMOTE);
        break;
      case FrameTypes.DATA:
        this.current_data_buffer = Buffer.concat([this.current_data_buffer, frame.payload]);
        if(frame.flags.END_STREAM){
          this.emit('transition_state', StreamState.STREAM_HALF_CLOSED_REMOTE);
        }
        break;
      case FrameTypes.RST_STREAM:
        this.emit('transition_state', StreamState.RST_STREAM);
        break;
    }
  }

  handle_reserved_remote_frame(frame){
    switch(frame.type){
      case FrameTypes.HEADERS:
        this.current_header_buffer = Buffer.concat([frame.payload]);
        this.emit('transition_state', StreamState.STREAM_HALF_CLOSED_LOCAL);
        this.delegate_frame(frame);
        break;
      case FrameTypes.RST_STREAM:
        this.emit('transition_state', StreamState.STREAM_CLOSED);
        break;
      case FrameTypes.PRIORITY:
        break;
      default:
        throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'invalid frame recieved: ' + FrameTypes.keys[frame.type], this.stream_id);
    }
  }

  handle_half_closed_remote_frame(frame){
    switch(frame.type){
      case FrameTypes.WINDOW_UPDATE:
      case FrameTypes.PRIORITY:
        break;
      case FrameTypes.RST_STREAM:
        this.emit('transition_state', StreamState.STREAM_CLOSED);
        break;
      default:
        throw new StreamError(ErrorCodes.STREAM_CLOSED, 'invalid frame recieved: ' + FrameTypes.keys[frame.type], this.stream_id);
    }
  }

  handle_closed_frame(frame){
    switch(frame.type){
      case FrameTypes.PRIORITY:
      case FrameTypes.WINDOW_UPDATE:
      case FrameTypes.RST_STREAM:
        break;
      default:
        throw new StreamError(ErrorCodes.STREAM_CLOSED, 'invalid frame recieved: ' + FrameTypes.keys[frame.type], this.stream_id);
    }
  }

  handle_half_closed_local_frame(frame){
    if(frame.flags.END_STREAM)
      this.emit('transition_state', StreamState.STREAM_CLOSED);
    switch(frame.type){
      case StreamState.RST_STREAM:
        this.emit('transition_state', StreamState.STREAM_CLOSED);
        break;
    }
  }

  transition_state(new_state){
    console.log(StreamState.keys[new_state]);
    switch(this.stream_state){
      case StreamState.STREAM_IDLE:
        if([StreamState.STREAM_OPEN, StreamState.STREAM_RESERVED_LOCAL, StreamState.STREAM_RESERVED_REMOTE].indexOf(new_state) != -1)
          this.stream_state = new_state;
        break;
      case StreamState.STREAM_RESERVED_LOCAL:
        if([StreamState.STREAM_CLOSED, StreamState.STREAM_HALF_CLOSED_REMOTE].indexOf(new_state) != -1)
          this.stream_state = new_state;
        break;
      case StreamState.STREAM_RESERVED_REMOTE:
        if([StreamState.STREAM_CLOSED, StreamState.STREAM_HALF_CLOSED_LOCAL].indexOf(new_state) != -1)
          this.stream_state = new_state;
        break;
      case StreamState.STREAM_OPEN:
        if([StreamState.STREAM_CLOSED, StreamState.STREAM_HALF_CLOSED_REMOTE, StreamState.STREAM_HALF_CLOSED_LOCAL].indexOf(new_state) != -1)
          this.stream_state = new_state;
        break;
      case StreamState.STREAM_HALF_CLOSED_REMOTE:
        if(StreamState.STREAM_CLOSED == new_state)
          this.stream_state = new_state;
        break;
      case StreamState.STREAM_HALF_CLOSED_LOCAL:
        if(StreamState.STREAM_CLOSED == new_state)
          this.stream_state = new_state;
        break;
    }
  }

  delegate_frame(frame){
    switch(frame.type){
      case FrameTypes.PRIORITY:
        this.stream_dependency = frame.stream_dependency;
        this.weight = frame.weight;
        this.exclusive = frame.exclusive;
        return this.session.priority.update_stream(this);
    }
    switch(this.stream_state){
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
      default:
        console.log('Not handling state: ' + this.stream_state);
    }
  }

  handle_request(){
    let headers = this.session.in_context.decompress(this.current_header_buffer);
    this.session.update_headers(headers);
    let request = new Request(this.session.headers, this.current_data_buffer);
    let response = new Response();
    let method = request.headers[':method'];
    let path = request.headers[':path'];
    let handlers = this.session.manager.get_handlers(method, path);
    let next_handler = this.generate_handler_chain(request, response, handlers);
    if(next_handler)
      next_handler();
    let frames = this.convert_response(request, response);
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
    console.log(this.flag_backlog);
  }

  check_flag(flag){
    if(typeof flag !== 'string')
      return;
    for(let i = this.flag_backlog.length - 1; i >= 0; i--){
      if(this.flag_backlog[i] == flag)
        return true;
    }
    return false;
  }

  convert_response(request, response){
    if(!response.payload)
      throw new Error('no response to client');
    response.headers['content-length'] = response.payload.length;
    let frames = [];
    let push_frames = [];
    let header_frame = new HeadersFrame();
    header_frame.stream_id = this.stream_id;
    header_frame.flags.END_HEADERS = true;

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
    for(let i = 0; i < response.required_paths.length; i++){
      let path = response.required_paths[i];
      let current_headers = {...this.session.headers};
      current_headers[':path'] = '/index.js';
      let current_request = new Request(current_headers, new Buffer(0));
      let current_response = new Response();
      let next_handler = this.generate_handler_chain(current_request, current_response, this.session.manager.get_handlers(path.method, path.path));
      if(next_handler)
        next_handler();
      let push_promise = new PushPromiseFrame();
      push_promise.flags.END_HEADERS = true;
      push_promise.promised_id = this.session.next_ostream_id;
      this.session.next_ostream_id += 2;
      push_promise.stream_id = this.stream_id;
      push_promise.payload = this.session.out_context.compress(Object.entries(current_headers).map(header => new Entry(header[0], header[1])));
      let current_push_frames = this.convert_response(current_request, current_response);
      current_push_frames.forEach(frame => {
        frame.stream_id = push_promise.promised_id;
      });
      push_frames = push_frames.concat(current_push_frames);
      frames.push(push_promise);
    }
    header_frame.payload = this.session.out_context.compress(headers);
    if(response.payload.length != 0 && request.headers[':method'] != 'HEAD'){
      let data_frame = new DataFrame();
      data_frame.stream_id = this.stream_id;
      data_frame.flags.END_STREAM = true;
      data_frame.payload = response.payload;
      frames.push(header_frame, data_frame);
    }
    else {
      header_frame.flags.END_STREAM = true;
      frames.push(header_frame);
    }
    console.log(frames);
    console.log(push_frames);
    console.log(frames.slice(0, response.required_paths.length).concat(push_frames).concat(frames.slice(response.required_paths.length)));
    return frames.slice(0, response.required_paths.length).concat(push_frames).concat(frames.slice(response.required_paths.length));
  }

  send_frame(frame){
    switch(this.stream_state){
      case StreamState.STREAM_HALF_CLOSED_REMOTE:
        if(frame.flags.END_STREAM)
          this.emit('transition_state', StreamState.STREAM_CLOSED);
        else if(frame instanceof RSTStreamFrame)
          this.emit('transition_state', StreamState.STREAM_CLOSED);
        break;
    }
    this.session.send_frame_istream(frame);
  }
}
