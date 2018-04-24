import IStream from './istream';
import {FrameTypes, ErrorCodes} from '../constants';
import {ConnectionError} from '../error';
import SettingsFrame from '../frame/settings';

export default class ControlStream extends IStream {
  constructor(id, session){
    super(id, session);
  }

  recieve_frame(frame){
    console.log();
    console.log('Control Stream ID: ' + this.stream_id);
    console.log('Frame type: ' + FrameTypes.keys[frame.type]);
    console.log(frame);
    switch(frame.type){
      case FrameTypes.SETTINGS:
        if(frame.flags.ACK)
          return;
        let ack_settings_frame = new SettingsFrame();
        ack_settings_frame.stream_id = 0;
        ack_settings_frame.flags.ACK = true;
        this.session.send_frame(ack_settings_frame);
        this.session.in_settings.update_settings(frame);
        this.session.in_context.set_max_table_size(this.session.in_settings.settings.SETTINGS_HEADER_TABLE_SIZE);
        break;
      case FrameTypes.WINDOW_UPDATE:
        this.session.flow_control.outgoing = frame.window_size;
        break;
      case FrameTypes.GOAWAY:
        break;
      default:
        throw new ConnectionError(ErrorCodes.PROTOCOL_ERROR, 'invalid frame recieved: ' + FrameTypes.keys[frame.type]);
    }
  }
}
