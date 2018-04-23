import {ConnectionError} from '../error';
import Frame from './frame';
import {FrameTypes, ErrorCodes} from '../constants';

export default class RSTStreamFrame extends Frame{
  error_code;

  constructor(opitions){
    super(FrameTypes.RST_STREAM, opitions);
    if(this.payload.length != 4)
      throw new ConnectionError(ErrorCodes.FRAME_SIZE_ERROR, 'non-4 octet frame size');
    if(!ErrorCodes.keys[this.payload.readUInt32BE(0)])
      throw new ConnectionError(ErrorCodes.INTERNAL_ERROR, 'unknown error code');
  }

  get_payload(){
    this.payload = new Buffer([(error_code >> 24), (error_code >> 16), (error_code >> 8), error_code]);
    return super.get_payload();
  }
}
