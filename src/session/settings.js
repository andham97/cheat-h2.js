import {SettingsEntries} from '../constants';
import SettingsFrame from '../frame/settings';

const init_values = {
  SETTINGS_HEADER_TABLE_SIZE: 0x1000,
  SETTINGS_ENABLE_PUSH: true,
  SETTINGS_MAX_CONCURRENT_STREAMS: -1,
  SETTINGS_INITIAL_WINDOW_SIZE: 0xffff,
  SETTINGS_MAX_FRAME_SIZE: 0x4000,
  SETTINGS_MAX_HEADER_LIST_SIZE: -1
};

export default class Settings {
  settings;

  constructor(){
    this.settings = {...init_values};
  }

  set_setting(code, value){
    if(code == 'keys')
      return;
    if(SettingsEntries[code] != undefined)
      this.settings[code] = value;
    else if(SettingsEntries.keys[code] != undefined)
      this.settings[SettingsEntries.keys[code]] = value;
  }

  update_settings(frame){
    if(!(frame instanceof SettingsFrame))
      return;
    Object.entries(frame.settings).forEach(setting => {
      
    });
  }

  to_frame(stream_id){
    if(stream_id == undefined || typeof stream_id !== 'number')
      return null;
    let settings_frame = new SettingsFrame();
    settings_frame.sid = stream_id;
    Object.entries(this.settings).forEach(setting => {
      if(init_values[setting[0]] != undefined && init_values[setting[0]] != setting[1])
        settings_frame.settings[setting[0]] = setting[1];
    });
    return settings_frame;
  }
}
