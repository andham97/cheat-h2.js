import EventEmitter from 'events';
import Frame from '../frame/frame';
import SettingsFrame from '../frame/settings';
import WindowUpdateFrame from '../frame/window_update';
import DataFrame from '../frame/data';
import GoawayFrame from '../frame/go_away';
import RSTStreamFrame from '../frame/rst_stream';
import Settings from './settings';
import Parser from '../frame/parser';
import IStream from './istream';
import ControlStream from './cstream';
import {SettingsEntries, ErrorCodes, FrameTypes, FrameFlags, StreamState} from '../constants';
import {ConnectionError, StreamError} from '../error';
import Context from '../hpack';
import FlowControl from './flow_control';
import Priority from './priority';

const init_buffer = new Buffer('PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n', 'binary');
const init_settings = (()=>{
  let settings = new Settings();
  settings.set_setting(SettingsEntries.SETTINGS_MAX_CONCURRENT_STREAMS, 20);
  return settings.to_frame(0);
})();
const init_window_update = new WindowUpdateFrame();
init_window_update.stream_id = 0;
init_window_update.window_size = 0xffff;

export default class Session extends EventEmitter {
  socket;
  is_init = false;
  open = true;
  session_id;
  manager;
  streams = {};
  active_in_streams = 0;
  active_out_streams = 0;
  priority;
  parser;
  in_context;
  in_settings;
  out_context;
  out_settings;
  flow_control;
  headers = {};


  constructor(sock, id, mgr){
    super();
    this.socket = sock;
    this.session_id = id;
    this.manager = mgr;
    this.parser = new Parser(this);
    this.in_settings = new Settings();
    this.out_settings = new Settings();
    this.out_settings.update_settings(init_settings);
    this.in_context = new Context();
    this.out_context = new Context();
    this.flow_control = new FlowControl();
    this.priority = new Priority();

    this.socket.on('data', (data) => {
      if(!this.is_init && Buffer.compare(data.slice(0, 24), init_buffer) == 0){
        this.send_frame(init_settings);
        this.send_frame(init_window_update);
        this.is_init = true;
        if(data.length == 24)
          return;
        data = data.slice(24);
      }
      if(!this.is_init)
        return this.socket.destroy();
      try {
        this.process_frame(data);
      }
      catch(error){
        this.error(error);
      }
    });
    this.socket.on('error', (error) => {
      this.error(error);
    });

    this.socket.on('close', () => {
      this.manager.session_close(this);
    });
  }

  update_headers(headers){
    for(let i = 0; i < headers.length; i++){
      this.headers[headers[i].name] = headers[i].value;
    }
  }

  process_frame(data){
    let frame = this.parser.decode(data);
    if(!(frame instanceof Frame))
      return;
    if((frame instanceof DataFrame) && !this.flow_control.recieve(frame.payload))
      throw new ConnectionError(ErrorCodes.FLOW_CONTROL_ERROR, 'recieving flow-control bounds exceeded');
    this.delegate_frame(frame);
  }

  delegate_frame(frame){
    for(let i = frame.stream_id-2; i > 0; i -= 2){
      if(this.streams[i].stream_state == StreamState.STREAM_IDLE)
        this.streams[i].emit('transition_state', StreamState.STREAM_CLOSED);
    }
    let stream = this.streams[frame.stream_id];
    if(stream)
      stream.recieve_frame(frame);
    else {
      if(frame.stream_id == 0)
        stream = new ControlStream(frame.stream_id, this);
      else
        stream = new IStream(frame.stream_id, this);
      this.streams[frame.stream_id] = stream;
      if(stream.stream_id != 0)
        this.priority.add_stream(stream);
      stream.recieve_frame(frame);
    }
    this.priority.get_next_streams().forEach((stream) => {
      if(stream.stream_state == StreamState.STREAM_HALF_CLOSED_REMOTE)
        stream.handle_request();
    });
  }

  send_frame(frame){
    console.log();
    console.log('SENDING');
    console.log(frame);
    if(frame.debug_data)
      console.log(frame.debug_data.toString());
    if((frame instanceof DataFrame) && !this.flow_control.send(frame.payload))
      throw new ConnectionError(ErrorCodes.FLOW_CONTROL_ERROR, 'recieving flow-control bounds exceeded');
    this.socket.write(this.parser.encode(frame), () => {
      if(frame instanceof GoawayFrame){
        console.log('DESTROING SOCKET');
        this.socket.destroy();
      }
    });
  }

  error(error){
    console.log();
    console.log(ErrorCodes.keys[error.error_code]);
    console.log(error);
    if(error.type == 0x1){
      let error_frame = new GoawayFrame();
      error_frame.last_stream_id = Math.max(error.stream_id - 2, 0);
      error_frame.stream_id = 0;
      error_frame.error_code = error.error_code;
      error_frame.debug_data = new Buffer(error.message, 'utf-8');
      this.send_frame(error_frame);
    }
    else if(error.type == 0x2){
      let error_frame = new RSTStreamFrame();
      error_frame.stream_id = error.stream_id;
      error_frame.error_code = error.error_code;
      this.send_frame(error_frame);
    }
    else {
      console.log('UNDEFINED ERROR TYPE: ' + error.constructor.name);
    }
  }
}
