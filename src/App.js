import React, { Component } from 'react';
import Content from './components/Content';
import Navbar from './components/Navbar';

class App extends Component {
  render() {
    return (
      <div>
        <Navbar/>
        <Content/>
      </div>
    );
  }
}

export default App;
