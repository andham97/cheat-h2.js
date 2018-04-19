import tls from 'tls';
import Frame from './frame';

export default class http2 {
  key;
  cert;
  server;

  constructor(opts){
    if(!opts)
      return;
    this.key = opts.key;
    this.cert = opts.cert;
    opts.ALPNProtocols = ['h2'];
    this.server = tls.createServer(opts, (socket) => {
      console.log('client connected ' + (socket.authorized ? 'auth' : 'non-auth'));
      console.log('address: ' + socket.remoteAddress);

      socket.on('data', (data) => {
        console.log('frame recieved');
        if(data.toString('utf-8') == 'PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n')
          return;
        let frame = new Frame({data: data.slice(0, 24).toString('utf-8') == 'PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n' ? data.slice(24) : data});
        console.log(frame);
      });
    });
  }

  listen(port) {
    if(!port)
      return;
    this.server.listen(port);
  }
}
