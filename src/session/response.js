import {Entry} from '../hpack';

export default class Response {
  headers;
  payload;
  is_sent = false;
  required_paths = [];

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
      throw new Error('Data is already sent');
    this.is_sent = true;
    if(data instanceof Buffer)
      this.payload = data;
    else if(data == undefined)
      this.payload = new Buffer(0);
    else if(data.toString)
      this.payload = new Buffer(data.toString(), (this.headers['content-type'] && this.headers['content-type'].indexOf('charset') == -1 ? 'utf-8' : this.headers['content-type'].split('charset')[1].split(';')[0].split(' ')[0].split('=')[1]));
  }

  push(path){
    if(!path)
      return;
    if(!path.method)
      return;
    if(!path.path)
      return;
    else
      this.required_paths.push(path);
  }
}
