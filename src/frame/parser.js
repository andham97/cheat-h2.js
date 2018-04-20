import { FrameTypes, FrameFlags, ErrorCodes } from '../constants';
import ConnectionError from '../error';
import DataFrame from './data';
import SettingsFrame from './settings';

export const decode = (data) => {
  let length = data.readUIntBE(0, 3);
  let type = data.readUIntBE(3, 1);
  let flags = data.readUIntBE(4, 1);
  let sid = data.readUIntBE(5, 4);
  let payload = data.slice(9, length+9);
  if(payload.length != length)
    throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'non-matching payload length. Header specified: ' + length + ', actual: ' + payload.length);
  let pref = {
    flags: flags,
    sid: sid,
    payload: payload
  };
  switch(type){
    case FrameTypes.DATA:
      return new DataFrame(pref);

    case FrameTypes.SETTINGS:
      return new SettingsFrame(pref);
  }
  //console.log({...pref, type: type, length: length});
}

export const encode = (frame) => {
  let header = new Buffer(9);
  if(frame.sid >= Math.pow(2, 31) || Math.abs(frame.sid) != frame.sid)
    throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'invalid stream id');
  if(frame.payload.length >= Math.pow(2, 24))
    throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'frame payload exceed max size');
  let flag = 0x0;
  Object.entries(frame.flags).forEach(f => {
    if(!f[1])
      return;
    flag |= FrameFlags[frame.type][f[0]];
  });
  let payload = frame.getPayload();
  header.writeUIntBE(payload.length, 0, 3);
  header.writeUIntBE(frame.type, 3, 1);
  header.writeUIntBE(flag, 4, 1);
  header.writeUIntBE(frame.sid, 5, 4);
  return Buffer.concat([header, payload]);
}
