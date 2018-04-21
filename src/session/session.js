import EventEmitter from 'events';
import Parser from '../frame/parser';
import SettingsFrame from '../frame/settings';
import Frame from '../frame/frame';
import Stream from './stream';
import {SettingsEntries, ErrorCodes, FrameTypes, FrameFlags} from '../constants';
import ConnectionError from '../error';

const initBuffer = new Buffer('PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n', 'binary');
const settings = new SettingsFrame();
settings.sid = 0;

const testFrames = [
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
    payload: new Buffer([0x1])
  }),
  new Frame(FrameTypes.CONTINUATION, {
    sid: 1,
    flags: 0x0,
    payload: new Buffer([0x2])
  }),
  new Frame(FrameTypes.CONTINUATION, {
    sid: 1,
    flags: 0x0,
    payload: new Buffer([0x3])
  }),
  new Frame(FrameTypes.CONTINUATION, {
    sid: 1,
    flags: 0x4,
    payload: new Buffer([0x4])
  }),
  new Frame(FrameTypes.CONTINUATION, {
    sid: 1,
    flags: 0x0,
    payload: new Buffer([0x5])
  }),
  new Frame(FrameTypes.DATA, {
    sid: 1,
    flags: 0x1,
    payload: new Buffer([0x54, 0x65, 0x73, 0x74])
  })
];

export default class Session extends EventEmitter {
  socket;
  isInit = false;
  open = true;
  id;
  manager;
  streams = {};
  parser;

  constructor(sock, id, mgr){
    super();
    this.socket = sock;
    this.id = id;
    this.manager = mgr;
    this.parser = new Parser(this);

    this.on('error', this.error);

    this.socket.write(this.parser.encode(settings));

    this.socket.on('data', (data) => {
      if(Buffer.compare(data.slice(0, 24), initBuffer) == 0){
        if(data.length == 24){
          this.isInit = true;
          return;
        }
        data = data.slice(24);
        this.isInit = true;
      }
      else if(!this.isInit)
        return this.emit('error', new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'invalid first frame'));
      this.delegateFrame(this.parser.decode(data));
    });
    this.socket.on('error', () => {});

    testFrames.forEach(frame => {
      //this.delegateFrame(frame);
    });
  }

  delegateFrame(frame){
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
