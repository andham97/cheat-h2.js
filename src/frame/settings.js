import Frame from './frame';

export default class SettingFrame extends Frame {
  constructor(opts){
    super(opts);
    if(!opts)
      opts = {}
  }
}
