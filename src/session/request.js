export default class Request {
  headers;
  query;
  body;

  constructor(headers, data){
    this.headers = {...headers};
    if(this.headers[':method'] == 'GET')
      this.query = new Buffer((this.headers[':path'].indexOf('?') == -1 ? 0 : this.headers[':path'].split('?')[1]));
    else
      this.body = Buffer.concat([new Buffer(0), data]);
    this.headers[':path'] = this.headers[':path'].split('?')[0];
  }
}
