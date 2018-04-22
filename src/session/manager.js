import EventEmitter from 'events';
import Session from './session';

export default class SessionManager extends EventEmitter {
  sessions = {};
  next_id = 0;
  server;

  constructor(server){
    super();
    this.server = server;
    this.on('session_close', this.session_close);
    //this.add_session({on: ()=>{}, write: ()=>{}});
  }

  add_session(socket){
    this.sessions[this.next_id] = new Session(socket, this.next_id, this);
    this.next_id++;
  }

  session_close(session){
    delete this.sessions[session.id];
  }
}
