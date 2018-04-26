import IStream from '../../src/session/istream';
import chai from 'chai';
import HeadersFrame from '../../src/frame/header';
import DataFrame from '../../src/frame/data';
import {StreamState} from '../../src/constants';
import Session from '../../src/session/session';
import SessionManager from '../../src/session/manager';

describe('Input stream', () => {
  it('should store the header frame data in the buffer and update the stream state', () => {
    let header = new HeadersFrame();
    header.stream_id = 1;
    header.payload = new Buffer([0x4f, 0x64, 0x61]);
    let stream = new IStream(1, {});
    stream.recieve_frame(header);
    chai.expect(stream.stream_state).to.equal(StreamState.STREAM_OPEN);
    chai.expect(stream.current_header_buffer).to.deep.equal(new Buffer([0x4f, 0x64, 0x61]));
  });

  it('should store the data frame in the buffer and update the stream state', () => {
    let header = new HeadersFrame();
    header.stream_id = 1;
    header.payload = new Buffer([0x4f, 0x64, 0x61]);
    header.flags.END_HEADERS = true;
    let data = new DataFrame();
    data.stream_id = 1;
    data.payload = new Buffer([0x4f, 0x64, 0x64]);
    data.flags.END_STREAM = true;
    let stream = new IStream(1, {});
    stream.recieve_frame(header);
    stream.recieve_frame(data);
    chai.expect(stream.stream_state).to.equal(StreamState.STREAM_HALF_CLOSED_REMOTE);
    chai.expect(stream.current_data_buffer).to.deep.equal(new Buffer([0x4f, 0x64, 0x64]));
  });

  it('should handle the request', () => {
    let header = new HeadersFrame();
    header.stream_id = 1;
    header.payload = new Buffer([0x82, 0x84]);
    header.flags.END_HEADERS = true;
    let data = new DataFrame();
    data.stream_id = 1;
    data.payload = new Buffer([0x4f, 0x64, 0x64]);
    data.flags.END_STREAM = true;
    let mgr = new SessionManager();
    mgr.register_get('/', (req, res) => {res.status(200).send("hei"); res.push({path: '/index.js', method: 'GET'})});
    let stream = new IStream(1, new Session({on: () => {}, write: () => {}}, 0, mgr));
    stream.recieve_frame(header);
    stream.recieve_frame(data);
    chai.expect(stream.stream_state).to.equal(StreamState.STREAM_HALF_CLOSED_REMOTE);
    stream.handle_request();
  });
});
