export default class FlowControl {
  incoming = 0xffff;
  outgoing = 0xffff;

  send(data){
    if(this.outgoing - data.length < 0)
      return false;
    this.outgoing -= data.length;
    return true;
  }

  recieve(data){
    if(this.incoming - data.length < 0)
      return false;
    this.incoming -= data.length;
    return true;
  }
}
