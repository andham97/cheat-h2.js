import {ConnectionError, StreamError} from '../error';
import {ErrorCodes} from '../constants';

export default class Request {
  headers;
  raw_data;
  query;
  body;

  constructor(headers, data){
    this.headers = {...headers};
    this.raw_data = Buffer.concat([new Buffer(0), data]);
    if(this.headers[':method']){
      if(this.headers[':method'] == 'POST' && this.headers['content-length'] > 0){
        if(this.headers['content-encoding'])
          throw new StreamError(ErrorCodes.INTERNAL_ERROR, 'non-supported encoding type');
        console.log(data.toString());
        let body = decodeURIComponent(data.toString());
        body = body.split('&');
        this.body = {};
        body.forEach(element => {
          let pair = element.split('=');
          if(pair.length != 2)
            return;
          this.body[pair[0]] = pair[1].split('+').join(' ');
        });
        console.log(this.body);
      }
      else if(this.headers[':method'] == 'GET' && this.headers[':path']){
        let path_query = this.headers[':path'].split('?');
        this.headers[':path'] = path_query[0];
        if(path_query.length == 2){
          this.query = {};
          let pairs = path_query[1].split('&');
          pairs.forEach(pair => {
            this.query[pair[0]] = pair[1];
          });
        }
      }
    }
  }
}
