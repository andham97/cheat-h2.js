import { FrameTypes, ErrorCodes, SettingsEntries } from '../constants';
import ConnectionError from '../error';
import Frame from './frame';

export default class SettingsFrame extends Frame {
  settings = {};

  constructor(opts){
    super(FrameTypes.SETTINGS, opts);
    if(this.payload.length % 6 != 0)
      session.emit('error', new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'non-6 octet frame size'));
    if(this.flags.ACK && this.payload.length != 0)
      session.emit('error', new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, '32-bit value not zero'))
    for(let i = 0; i < this.payload.length; i += 6){
      this.settings[SettingsEntries.keys[this.payload.readUIntBE(i, 2)]] = this.payload.readUIntBE(i+2, 4);
    }
  }

  set_setting(setting, value){
    this.settings[SettingsEntries.keys[setting]] = value;
  }

  get_payload(){
    this.payload = new Buffer(0);
    if(!this.flags.ACK){
      Object.entries(this.settings).forEach(f => {
        let tempBuff = new Buffer(6);
        tempBuff.writeUIntBE(SettingsEntries[f[0]], 0, 2);
        tempBuff.writeUIntBE(f[1], 2, 4);
        this.payload = Buffer.concat([this.payload, tempBuff]);
      });
    }
    return super.get_payload();
  }
}
