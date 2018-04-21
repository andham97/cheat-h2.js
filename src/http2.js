import tls from 'tls';
import SessionManager from './session/manager';

export default class http2 {
  key;
  cert;
  server;
  sessionManager;

  constructor(opts){
    if(!opts)
      return;
    this.key = opts.key;
    this.cert = opts.cert;
    this.sessionManager = new SessionManager();
    opts.ALPNProtocols = ['h2'];
    this.server = tls.createServer(opts, (socket) => {
      this.sessionManager.addSession(socket);
    });
  }

  listen(port) {
    if(!port)
      return;
    this.server.listen(port);
  }
}
