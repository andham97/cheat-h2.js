import EventEmitter from 'events';
import Session from './session';

export default class SessionManager extends EventEmitter {
  sessions = {};
  nextId = 0;

  constructor(){
    super();
    this.on('session_close', this.sessionClose);
    this.addSession({on: () => {}, write: () => {}});
  }

  addSession(socket){
    this.sessions[this.nextId] = new Session(socket, this.nextId, this);
    this.nextId++;
  }

  sessionClose(session){
    delete this.sessions[session.id];
  }
}
