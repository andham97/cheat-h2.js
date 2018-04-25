import { FrameTypes, ErrorCodes, SettingsEntries } from '../constants';
import {ConnectionError} from '../error';
import Frame from './frame';

export default class SettingsFrame extends Frame {
  settings = {};

  constructor(options){
    super(FrameTypes.SETTINGS, options);
    if(!options)
      return;
    if(this.stream_id != 0)
      throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'non-zero stream id');
    if(this.payload.length % 6 != 0)
      throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'non-6 octet frame size');
    if(this.flags.ACK && this.payload.length != 0)
      throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, '32-bit value not zero');
    for(let i = 0; i < this.payload.length; i += 6){
      this.settings[SettingsEntries.keys[this.payload.readUIntBE(i, 2)]] = this.payload.readUIntBE(i + 2, 4);
    }
  }

  set_setting(setting, value){
    this.settings[SettingsEntries.keys[setting]] = value;
  }

  get_payload(){
    if(!this.flags.ACK){
      let entries = Object.entries(this.settings);
      if(entries.length > 0){
        this.payload = new Buffer(6 * entries.length);
        entries.forEach((setting, i) => {
          this.payload.writeUIntBE(SettingsEntries[setting[0]], i * 6, 2);
          this.payload.writeUIntBE((typeof setting[1] == 'boolean' ? (setting[1] ? 1 : 0) : setting[1]), (i * 6) + 2, 4);
        });
      }
    }
    else
      this.payload = new Buffer(0);
    return super.get_payload();
  }
}
