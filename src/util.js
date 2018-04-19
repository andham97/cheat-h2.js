import { FrameTypes, FrameFlags } from './frame';

export const typeToString = (type) => {
  let t = Object.entries(FrameTypes).filter(pair => {
    return pair[1] == type;
  })[0];
  return t ? t[0] : t;
}

export const flagToString = (flag, type) => {
  let t = Object.entries(FrameFlags[type]).filter(pair => {
    return pair[1] == flag;
  })[0];
  return t ? t[0] : t;
}
