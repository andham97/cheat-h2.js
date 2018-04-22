import * as Parser from './parser';

let dataBuff = new Buffer([0x00, 0x00, 0x0d, 0x00, 0x09, 0x00, 0x00, 0x00, 0x01, 0x01, 0x4f, 0x64, 0x61, 0x20, 0x65, 0x72, 0x20, 0x6b, 0x75, 0x6c, 0x21, 0x00]);
let settingBuff = new Buffer([]);

let handlers = [(req, res, next) => {
  console.log(1);
  next();
},(req, res, next) => {
  console.log(2);
  next();
},(req, res, next) => {
  console.log(3);
  next();
},(req, res, next) => {
  console.log(4);
  next();
}];

let gen = (req, res, handlers, i) => {
  if(i === undefined)
    i = 0;
  return () => {
    if(i < handlers.length - 1)
      handlers[i](req, res, gen(req, res, handlers, i + 1));
    else
      handlers[i](req, res, ()=>{});
  }
}
gen(null, null, handlers)();
