import Stream from './stream';

const default_weight = 16;

export default class Priority{
  priority_queue = [];

  add_stream(stream){
    if(stream.weight == -1)
      stream.weight = default_weight;
    let dependency_found = false;
    for(let i = 0; i < this.priority_queue.length; i++){
      if(!dependency_found && this.priority_queue[i].stream_id == stream.stream_dependency)
        dependency_found = true;
      else if(dependency_found){
        if(this.priority_queue[i].stream_dependency == stream.stream_dependency && this.priority_queue[i].weight < stream.weight){
          this.priority_queue = this.priority_queue.slice(0, i).concat([stream], this.priority_queue.slice(i, this.priority_queue.length));
          return;
        }
        else if(this.priority_queue[i].stream_dependency != stream.stream_dependency){
          this.priority_queue = this.priority_queue.slice(0, i).concat([stream], this.priority_queue.slice(i, this.priority_queue.length));
          return;
        }
      }
    }
    this.priority_queue.push(stream);
  }

  get_stream(){
    if(this.priority_queue.length < 1)
      return null;
    let current_stream = this.priority_queue[1];
    this.priority_queue.splice(1, 1);
    for(let i = 1; i < this.priority_queue.length; i++){
      if(this.priority_queue[i].stream_dependency == current_stream.stream_id)
        this.priority_queue[i].stream_dependency = 0;
      else
        break;
    }
    return current_stream;
  }

  update_stream(stream){
    for(let i = 0; i < this.priority_queue.length; i++){
      if(this.priority_queue[i].stream_id == stream.stream_id){
        this.priority_queue.splice(i, 1);
        break;
      }
    }
    this.add_stream(stream);
  }
}
