import {Entry} from '../hpack';

export default class Response {
  headers;
  payload;
  is_sent = false;

  constructor(headers){
    this.headers = {
      'content-type': 'text/plain; charset=utf-8',
      'content-length': 0
    };
  }

  status(code){
    this.headers[':status'] = code;
    return this;
  }

  send(data){
    if(this.is_sent)
      return; // Is sent error
    this.is_sent = true;
    if(data instanceof Buffer)
      this.payload = data;
    else
      this.payload = new Buffer(data.toString(), (this.headers['content-type'] && this.headers['content-type'].indexOf('charset') == -1 ? 'utf-8' : this.headers['content-type'].split('charset')[1].split(';')[0].split(' ')[0].split('=')[1]));
  }
}
