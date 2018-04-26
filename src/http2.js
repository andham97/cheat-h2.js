import tls from 'tls';
import SessionManager from './session/manager';

let session_manager;

export default class http2 {
  key;
  cert;
  server;

  constructor(options){
    if(!options || !options.key || !options.cert)
      throw new Error('Need private key and public certificate for server initiation');
    this.key = options.key;
    this.cert = options.cert;
    session_manager = new SessionManager();
    options.ALPNProtocols = ['h2'];
    this.server = tls.createServer(options, (socket) => {
      session_manager.add_session(socket);
    });
  }

  get(path, handler){
    if(!path || !handler)
      throw new Error('Path or handler not specified');
    session_manager.register_get(path, handler);
  }

  post(path, handler){
    if(!path || !handler)
      throw new Error('Path or handler not specified');
    session_manager.register_post(path, handler);
  }

  use(path, handler){
    if(!handler)
      session_manager.register_middleware(path);
    else
      session_manager.register_path(path, handler);
  }

  listen(port) {
    if(!port)
      return;
    this.server.listen(port);
  }
}
