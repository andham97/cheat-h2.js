import EventEmitter from 'events';
import Parser from '../frame/parser';
import SettingsFrame from '../frame/settings';
import WindowUpdateFrame from '../frame/window_update';
import Frame from '../frame/frame';
import IStream from './istream';
import {SettingsEntries, ErrorCodes, FrameTypes, FrameFlags} from '../constants';
import ConnectionError from '../error';
import Context from '../hpack';

const init_buffer = new Buffer('PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n', 'binary');
const init_settings = new SettingsFrame();
const init_window_update = new WindowUpdateFrame();
init_settings.sid = 0;
init_window_update.sid = 0;
init_window_update.set_data(new Buffer([0x0, 0x0, 0xff, 0xff]));

export default class Session extends EventEmitter {
  socket;
  is_init = false;
  open = true;
  id;
  manager;
  streams = {};
  parser;
  in_context;
  out_context;
  flow_control;

  constructor(sock, id, mgr){
    super();
    this.socket = sock;
    this.id = id;
    this.manager = mgr;
    this.parser = new Parser(this);
    this.in_context = new Context();
    this.out_context = new Context();
    this.flow_control = new FlowControl();

    this.on('error', this.error);

    this.socket.on('data', (data) => {
      if(!this.id_init && Buffer.compare(data.slice(0, 24), init_buffer) == 0){
        this.send_frame(init_settings);
        this.send_frame(init_window_update);
        this.is_init = true;
        if(data.length == 24)
          return;
        data = data.slice(24);
      }
      this.delegate_frame(data);
      if(!this.is_init)
        return this.emit('error', new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'invalid first frame'));
    });
    this.socket.on('error', () => {});

    test_frames.forEach(frame => {
      //this.delegate_frame(frame);
    });
  }

  delegate_frame(data){
    let frame = this.parser.encode(data);
    if(!(frame instanceof Frame))
      return;
    if(frame.sid == 0 && frame instanceof WindowUpdateFrame){
      
    }
    else if(frame.sid == 0 && frame instanceof SettingsFrame){
      let ack_settings_frame = new SettingsFrame();
      ack_settings_frame.sid = 0;
      ack_settings_frame.flags.ACK = true;
      this.send_frame(ack_settings_frame);
    }
    if(!this.flow_control.recieve_frame(data))
      return;
    for(let i = frame.sid-2; i > 0; i-=2){
      if(this.streams[i].state == StreamState.STREAM_IDLE)
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
    if(!this.flow_control.send(data));
      return; // FLOW ERROR
    this.socket.write(data);
  }

  error(err){
    console.log(err);
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
