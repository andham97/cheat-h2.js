import EventEmitter from 'events';
import Frame from '../frame/frame';
import SettingsFrame from '../frame/settings';
import WindowUpdateFrame from '../frame/window_update';
import DataFrame from '../frame/data';
import GoawayFrame from '../frame/go_away';
import Settings from './settings';
import Parser from '../frame/parser';
import IStream from './istream';
import ControlStream from './cstream';
import {SettingsEntries, ErrorCodes, FrameTypes, FrameFlags, StreamState} from '../constants';
import ConnectionError from '../error';
import Context from '../hpack';
import FlowControl from './flow_control';

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
  parser;
  in_context;
  in_settings;
  out_context;
  out_settings;
  flow_control;
  headers = {};
  log;

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
        return this.error(new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'invalid first frame'));
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

    test_frames.forEach(frame => {
      try{
        //this.delegate_frame(frame);
      }
      catch(error){
        this.error(error);
      }
    });

    this.socket.on('close', console.log);
  }

  update_headers(headers){
    for(let i = 0; i < headers.length; i++){
      this.headers[headers[i].name] = headers[i].value;
    }
  }

  process_frame(data){
    let frame = this.parser.decode(data);
    if(frame instanceof DataFrame && !this.flow_control.recieve(data))
      return;
    this.delegate_frame(frame);
  }

  delegate_frame(frame){
    console.log('\nrecieving');
    console.log(frame);
    if(!(frame instanceof Frame))
      return;
    for(let i = frame.stream_id-2; i > 0; i-=2){
      if(this.streams[i].stream_state == StreamState.STREAM_IDLE)
        this.streams[i].emit('transition_state', StreamState.STREAM_CLOSED);
    }
    let stream = this.streams[frame.stream_id];
    if(stream)
      return stream.emit('recieve_frame', frame);
    if(frame.stream_id == 0)
      stream = new ControlStream(frame.stream_id, this);
    else
      stream = new IStream(frame.stream_id, this);
    this.streams[frame.stream_id] = stream;
    stream.emit('recieve_frame', frame);
  }

  send_frame(frame){
    console.log('\nsending');
    console.log(frame);
    if(frame.debug_data)
      console.log(frame.debug_data.toString());
    let data = this.parser.encode(frame);
    if(!this.flow_control.send(data))
      return; // FLOW ERROR
    this.socket.write(data);
  }

  error(error){
    //if(error.error_code == undefined && error.code != 'ECONNRESET')
      //throw error;
    console.log();
    console.log(ErrorCodes.keys[error.error_code]);
    console.log(error);
  }
}

const test_frames = [
  new Frame(FrameTypes.SETTINGS, {
    stream_id: 0,
    flags: 0x0
  }),
  new Frame(FrameTypes.WINDOW_UPDATE, {
    stream_id: 0,
    flags: 0x0
  }),
  new Frame(FrameTypes.HEADERS, {
    stream_id: 1,
    flags: 0x0,
    payload: new Buffer([0x40, 0x84, 0xb9, 0x58, 0xd3, 0x3f])
  }),
  new Frame(FrameTypes.CONTINUATION, {
    stream_id: 1,
    flags: 0x0,
    payload: new Buffer([0x87, 0x61, 0x25, 0x42, 0x57, 0x9d])
  }),
  new Frame(FrameTypes.CONTINUATION, {
    stream_id: 1,
    flags: 0x0,
    payload: new Buffer([0x34, 0xd1, 0x40, 0x85, 0xb9, 0x49])
  }),
  new Frame(FrameTypes.CONTINUATION, {
    stream_id: 1,
    flags: 0x4,
    payload: new Buffer([0x53, 0x39, 0xe4, 0x83, 0xc5, 0x83, 0x7f])
  }),
  new Frame(FrameTypes.CONTINUATION, {
    stream_id: 1,
    flags: 0x0,
    payload: new Buffer([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])
  }),
  new Frame(FrameTypes.DATA, {
    stream_id: 1,
    flags: 0x1,
    payload: new Buffer([0x54, 0x65, 0x73, 0x74])
  })
];
