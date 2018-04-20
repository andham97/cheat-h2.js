import tls from 'tls';
import * as Parser from './frame/parser';
import SettingFrame from './frame/settings';
import DataFrame from './frame/data';
import { SettingsEntries, ErrorCodes } from './constants';
import ConnectionError from './error';

const initBuffer = new Buffer('PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n', 'binary');
const settings = new SettingFrame();
settings.sid = 0;
settings.setSetting(SettingsEntries.SETTINGS_MAX_CONCURRENT_STREAMS, 10);



export default class http2 {
  key;
  cert;
  server;

  constructor(opts){
    if(!opts)
      return;
    this.key = opts.key;
    this.cert = opts.cert;
    opts.ALPNProtocols = ['h2'];
    this.server = tls.createServer(opts, (socket) => {
      socket.write(Parser.encode(settings));
      socket.on('data', (data) => {
        if(Buffer.compare(data.slice(0, 24), initBuffer) == 0){
          if(data.length == 24)
            return;
          data = data.slice(24);
        }
        let frame = Parser.decode(data);
        console.log(frame);
        console.log();
        if(frame instanceof SettingFrame){
          let set = new SettingFrame();
          set.flags.ACK = true;
          set.sid = 1;
          socket.write(Parser.encode(set));
        }
      });
    });
  }

  listen(port) {
    if(!port)
      return;
    this.server.listen(port);
  }
}
