import EventEmitter from 'events';
import Session from './session';

export default class SessionManager extends EventEmitter {
  sessions = {};
  next_id = 0;
  paths = {
    get: {},
    post: {},
    head: {}
  };

  constructor(){
    super();
    this.on('session_close', this.session_close);
    this.add_session({on: ()=> {}, write: (data)=>{}});
  }

  add_session(socket){
    this.sessions[this.next_id] = new Session(socket, this.next_id, this);
    this.next_id++;
  }

  get_handlers(method, path){
    let handlers = this.paths[method.toLowerCase()][path];
    if(!handlers || handlers.length == 0)
      return [this.request_404_handler];
    return handlers;
  }

  session_close(session){
    delete this.sessions[session.session_id];
  }

  register_get(path, handler){
    if(!this.paths.get[path])
      this.paths.get[path] = [];
    if(!this.paths.head[path])
      this.paths.head[path] = [];
    this.paths.head[path].push(handler);
    this.paths.get[path].push(handler);
  }

  register_post(path, handler){
    if(!this.paths.post[path])
      this.paths.post[path] = [];
    this.paths.post[path].push(handler);
  }

  request_404_handler(request, response){
    response.status(404).send('error fetching ' + request.headers[':path'] + ' resource not found');
  }
}
