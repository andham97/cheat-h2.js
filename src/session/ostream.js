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

export default class OStream extends Stream {
  current_data_buffer = new Buffer(0);
  current_header_buffer = new Buffer(0);
  flag_backlog = [];
  current_response

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
        if(frame.flags.END_STREAM){
          this.emit('transition_state', StreamState.STREAM_HALF_CLOSED_LOCAL);
        }
        this.session.send_frame_ostream(frame);
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
    if(!this.check_flag('END_HEADERS') && [FrameTypes.CONTINUATION, FrameTypes.HEADERS].indexOf(frame.type) != -1)
      throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'not finished sending headers');
    switch(frame.type){
      case FrameTypes.HEADERS:
        this.emit('transition_state', StreamState.STREAM_HALF_CLOSED_REMOTE);
        if(frame.flags.END_STREAM){
          this.emit('transition_state', StreamState.STREAM_CLOSED);
        }
        this.session.send_frame_ostream(frame);
        break;
      case FrameTypes.DATA:
      case FrameTypes.CONTINUATION:
        if(frame.flags.END_STREAM){
          this.emit('transition_state', StreamState.STREAM_CLOSED);
        }
        this.session.send_frame_ostream(frame);
        break;
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
          throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'sending continuation frame after END_HEADERS flag set');
        if(frame.flags.END_STREAM)
          this.emit('transition_state', StreamState.STREAM_HALF_CLOSED_REMOTE);
        this.session.send_frame_ostream(frame);
        break;
      case FrameTypes.DATA:
        if(this.check_flag('END_STREAM'))
          throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'sending data frame after END_STREAM flag set');
        if(frame.flags.END_STREAM)
          this.emit('transition_state', StreamState.STREAM_HALF_CLOSED_REMOTE);
        this.session.send_frame_ostream(frame);
        break;
      case FrameTypes.RST_STREAM:
        this.emit('transition_state', StreamState.RST_STREAM);
        break;
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
}
