import tls from 'tls';
import SessionManager from './session/manager';

let session_manager;

export default class http2 {
  key;
  cert;
  server;

  constructor(opts){
    if(!opts)
      return;
    this.key = opts.key;
    this.cert = opts.cert;
    session_manager = new SessionManager();
    opts.ALPNProtocols = ['h2'];
    this.server = tls.createServer(opts, (socket) => {
      session_manager.add_session(socket);
    });
  }

  get(path, handler){
    session_manager.register_get(path, handler);
  }

  post(path, handler){
    session_manager.register_post(path, handler);
  }

  listen(port) {
    if(!port)
      return;
    this.server.listen(port);
  }
}
