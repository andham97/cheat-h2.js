import tls from 'tls';
import SessionManager from './session/manager';

export default class http2 {
  key;
  cert;
  server;
  session_manager;

  constructor(opts){
    if(!opts)
      return;
    this.key = opts.key;
    this.cert = opts.cert;
    this.session_manager = new SessionManager();
    opts.ALPNProtocols = ['h2'];
    this.server = tls.createServer(opts, (socket) => {
      this.session_manager.add_session(socket);
    });
  }

  get(path, handler){
    this.session_manager.register_get(path, handler);
  }

  post(path, handler){
    this.session_manager.register_post(path, handler);
  }

  listen(port) {
    if(!port)
      return;
    this.server.listen(port);
  }
}
