import { FrameTypes, FrameFlags } from '../constants';
import DataFrame from './data';

export const decode = (data) => {
  let length = data.readUIntBE(0, 3);
  let type = data.readUIntBE(3, 1);
  let flags = data.readUIntBE(4, 1);
  let sid = data.readUIntBE(5, 4);
  let payload = data.slice(9, length+9);
  if(payload.length != length)
    throw new Error('Parse error, length not matching');
  switch(type){
    case FrameTypes.DATA:
      return new DataFrame({
        flags: flags,
        sid: sid,
        payload: payload
      });
    case FrameTypes.SETTINGS
  }
}

export const encode = (frame) => {
  let header = new Buffer(9);
  if(frame.sid >= Math.pow(2, 31) || Math.abs(frame.sid) != frame.sid)
    throw new Error('Invalid stream id');
  if(frame.payload.length >= Math.pow(2, 24))
    throw new Error('Frame payload exceed max size');
  let flag = 0x0;
  Object.entries(frame.flags).forEach(f => {
    if(!f[1])
      return;
    flag |= FrameFlags[frame.type][f[0]];
  });
  header.writeUIntBE(frame.payload.length, 0, 3);
  header.writeUIntBE(frame.type, 3, 1);
  header.writeUIntBE(flag, 4, 1);
  header.writeUIntBE(frame.sid, 5, 4);
  return Buffer.concat([header, frame.payload]);
}
