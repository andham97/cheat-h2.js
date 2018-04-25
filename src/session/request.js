import {ConnectionError} from '../error';
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
      if(this.headers[':method'] == 'GET')
        this.query = new Buffer((this.headers[':path'].indexOf('?') == -1 ? 0 : this.headers[':path'].split('?')[1]));
      else
        this.body = Buffer.concat([new Buffer(0), data]);
    }
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
