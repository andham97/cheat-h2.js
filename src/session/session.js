import EventEmitter from 'events';
import Parser from '../frame/parser';
import SettingsFrame from '../frame/settings';
import Settings from './settings';
import WindowUpdateFrame from '../frame/window_update';
import Frame from '../frame/frame';
import IStream from './istream';
import {SettingsEntries, ErrorCodes, FrameTypes, FrameFlags, StreamState} from '../constants';
import ConnectionError from '../error';
import Context from '../hpack';
import FlowControl from './flow_control';

const init_buffer = new Buffer('PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n', 'binary');
const init_settings = (()=>{
  let settings = new Settings();
  settings.set_setting(SettingsEntries.SETTINGS_MAX_CONCURRENT_STREAMS, 20);
  settings.set_setting(SettingsEntries.SETTINGS_MAX_HEADER_LIST_SIZE, 3);
  return settings.to_frame(0);
})();
const init_window_update = new WindowUpdateFrame();
console.log(init_settings);
init_window_update.sid = 0;
init_window_update.set_data(new Buffer([0x0, 0x0, 0xff, 0xff]));

export default class Session extends EventEmitter {
  socket;
  is_init = false;
  open = true;
  session_id;
  manager;
  streams = {};
  parser;
  in_context;
  out_context;
  flow_control;
  headers = {};
  settings = {};

  constructor(sock, id, mgr){
    super();
    this.socket = sock;
    this.session_id = id;
    this.manager = mgr;
    this.parser = new Parser(this);
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
      this.process_frame(data);
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
  }

  update_headers(headers){
    for(let i = 0; i < headers.length; i++){
      this.headers[headers[i].name] = headers[i].value;
    }
  }

  process_frame(data){
    let frame = this.parser.decode(data);
    if(frame.sid == 0 && frame instanceof WindowUpdateFrame){

    }
    else if(frame.sid == 0 && frame instanceof SettingsFrame){
      let ack_settings_frame = new SettingsFrame();
      ack_settings_frame.sid = 0;
      ack_settings_frame.flags.ACK = true;
      this.send_frame(ack_settings_frame);
    }
    if(!this.flow_control.recieve(data))
      return;
    try {
      this.delegate_frame(frame);
    }
    catch(error){
      this.error(error);
    }
  }

  delegate_frame(frame){
    if(!(frame instanceof Frame))
      return;

    for(let i = frame.sid-2; i > 0; i-=2){
      if(this.streams[i].stream_state == StreamState.STREAM_IDLE)
        this.streams[i].emit('transition_state', StreamState.STREAM_CLOSED);
    }
    let stream = this.streams[frame.sid];
    if(stream)
      return stream.emit('recieve_frame', frame);
    stream = new IStream(frame.sid, this);
    this.streams[frame.sid] = stream;
    stream.emit('recieve_frame', frame);
  }

  send_frame(frame){
    let data = this.parser.encode(frame);
    if(!this.flow_control.send(data))
      return; // FLOW ERROR
    this.socket.write(data);
  }

  error(error){
    if(error.error_code == undefined)
      throw error;
    console.log(ErrorCodes.keys[error.error_code]);
  }
}

const test_frames = [
  new Frame(FrameTypes.SETTINGS, {
    sid: 0,
    flags: 0x0
  }),
  new Frame(FrameTypes.WINDOW_UPDATE, {
    sid: 0,
    flags: 0x0
  }),
  new Frame(FrameTypes.HEADERS, {
    sid: 1,
    flags: 0x0,
    payload: new Buffer([0x40, 0x84, 0xb9, 0x58, 0xd3, 0x3f])
  }),
  new Frame(FrameTypes.CONTINUATION, {
    sid: 1,
    flags: 0x0,
    payload: new Buffer([0x87, 0x61, 0x25, 0x42, 0x57, 0x9d])
  }),
  new Frame(FrameTypes.CONTINUATION, {
    sid: 1,
    flags: 0x0,
    payload: new Buffer([0x34, 0xd1, 0x40, 0x85, 0xb9, 0x49])
  }),
  new Frame(FrameTypes.CONTINUATION, {
    sid: 1,
    flags: 0x4,
    payload: new Buffer([0x53, 0x39, 0xe4, 0x83, 0xc5, 0x83, 0x7f])
  }),
  new Frame(FrameTypes.CONTINUATION, {
    sid: 1,
    flags: 0x0,
    payload: new Buffer([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])
  }),
  new Frame(FrameTypes.DATA, {
    sid: 1,
    flags: 0x1,
    payload: new Buffer([0x54, 0x65, 0x73, 0x74])
  })
];