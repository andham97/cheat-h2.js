export default class FlowControl {
  incoming = 0xffff;
  outgoing = 0xffff;

  send(data){
    if(this.incoming - data.length < 0)
      return false;
    this.incoming -= data.length;
    return true;
  }
}
