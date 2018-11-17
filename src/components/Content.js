import React, { Component } from 'react';
import Schedule from './Schedule';
import LogCard from './LogCard';

class Content extends Component {
render(){
  return (
    <div>
      <div style={{height: '25px'}}></div>
      <Schedule/>
      <LogCard/>
    </div>

  )
}

}

export default Content;
