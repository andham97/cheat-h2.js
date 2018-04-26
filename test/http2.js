import h2 from '../src/http2';
import chai from 'chai';
import fs from 'fs';

const private_key = fs.readFileSync(__dirname + '/../cert/private-key.pem');
const public_cert = fs.readFileSync(__dirname + '/../cert/public-cert.pem');

describe('testing api setup methods', () => {
  it('should throw missing certificate error', () => {
    chai.expect(() => new h2()).to.throw();
    chai.expect(() => new h2({key: private_key})).to.throw();
    chai.expect(() => new h2({cert: public_cert})).to.throw();
  });

  it('should accept input and not throw any errors', () => {
    chai.expect(() => new h2({key: private_key, cert: public_cert})).to.not.throw();
  });

  it('should throw invalid argument error', () => {
    chai.expect(() => new h2({key: private_key, cert: public_cert}).get()).to.throw();
    chai.expect(() => new h2({key: private_key, cert: public_cert}).get('/')).to.throw();
  });

  it('should accept input and not throw any errors', () => {
    chai.expect(() => new h2({key: private_key, cert: public_cert}).get('/', ()=>{})).to.not.throw();
  });

  it('should throw invalid argument error', () => {
    chai.expect(() => new h2({key: private_key, cert: public_cert}).post()).to.throw();
    chai.expect(() => new h2({key: private_key, cert: public_cert}).post('/')).to.throw();
  });

  it('should accept input and not throw any errors', () => {
    chai.expect(() => new h2({key: private_key, cert: public_cert}).post('/', ()=>{})).to.not.throw();
  });
});
