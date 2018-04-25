import Stream from './stream';
import {StreamState} from '../constants';

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

  get_next_streams(){
    if(this.priority_queue.length == 0)
      return [];
    let current_stream = [];
    let closed_streams = [];
    let i = 0;
    while(i < this.priority_queue.length && this.priority_queue[i].stream_dependency == 0){
      if(this.priority_queue[i].stream_state == StreamState.STREAM_CLOSED){
        closed_streams.push(this.priority_queue[i].stream_id);
        this.priority_queue.splice(i, 1);
      }
      else {
        current_stream.push(this.priority_queue[i]);
        i++;
      }
    }
    for(; i < this.priority_queue.length; i++){
      if(closed_streams.indexOf(this.priority_queue[i].stream_dependency) != -1)
        this.priority_queue[i].stream_dependency = 0;
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
