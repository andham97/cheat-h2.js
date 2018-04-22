import EventEmitter from 'events';
import Parser from '../frame/parser';
import SettingsFrame from '../frame/settings';
import Frame from '../frame/frame';
import Stream from './stream';
import {SettingsEntries, ErrorCodes, FrameTypes, FrameFlags} from '../constants';
import ConnectionError from '../error';
import Context from '../hpack';

const init_buffer = new Buffer('PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n', 'binary');
const settings = new SettingsFrame();
settings.sid = 0;

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

  constructor(sock, id, mgr){
    super();
    this.socket = sock;
    this.id = id;
    this.manager = mgr;
    this.parser = new Parser(this);
    this.in_context = new Context();
    this.out_context = new Context();

    this.on('error', this.error);

    this.socket.write(this.parser.encode(settings));

    this.socket.on('data', (data) => {
      if(Buffer.compare(data.slice(0, 24), init_buffer) == 0){
        if(data.length == 24){
          this.is_init = true;
          return;
        }
        data = data.slice(24);
        this.is_init = true;
      }
      else if(!this.is_init)
        return this.emit('error', new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'invalid first frame'));
      this.delegate_frame(this.parser.decode(data));
    });
    this.socket.on('error', () => {});

    test_frames.forEach(frame => {
      //this.delegate_frame(frame);
    });
  }

  delegate_frame(frame){
    if(!(frame instanceof Frame))
      return;
    let stream = this.streams[frame.sid];
    if(stream)
      return stream.emit('recv_frame', frame);
    stream = new Stream(frame.sid, this);
    this.streams[frame.sid] = stream;
    stream.emit('recv_frame', frame);
  }

  error(err){
    console.log(err);
  }
}
