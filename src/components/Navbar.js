import React, { Component } from 'react';
import { Sun, CloudRain } from 'react-feather';
import '../styles/Navbar.css'

class Navbar extends Component {
  constructor(){
    super();
    this.state = {
      rain: null,
      loaded: false
    };

    this.rainClick = this.rainClick.bind(this);
  }

  componentDidMount() {
    fetch('http://10.0.0.252/sprinkler_service.php?name=rain')
      .then((results) => {
        return results.json();
      })
      .then((responseJson) => {
        let rain;
        if (responseJson[0] === '0') {
          rain = false;
        } else {
          rain = true;
        }
        this.setState({
          rain: rain,
          loaded: true
        });
      })
  }

  rainClick() {
    let newRain = !this.state.rain;
    let dbValue;
    if (newRain) {
      dbValue = 1;
    } else {
      dbValue = 0;
    }
    fetch('http://10.0.0.252/sprinkler_service.php', {
      method: 'POST',
      body: JSON.stringify({
        name: 'rain',
        value: dbValue
      }),
      headers: {
      'user-agent': 'Mozilla/4.0 MDN Example',
      'content-type': 'application/json'
     }
    })
    .then((response) => {
      if (!response.ok) {
        console.log('bad');
    }
      return response.json();
    })
    .then((response) => {
      console.log(response)
    })
    .catch(error => console.log(error) );

    this.setState({rain: !this.state.rain});
  }

  render(){
    let icon;
    if (!this.state.loaded) {
      icon = '...';
    } else {
      if (this.state.rain) {
        icon = <CloudRain size={20}/>;
      } else {
        icon = <Sun size={20}/>;
      }
    }
    return (
      <div className='main_bar'>
        <div className='btn1' onClick={this.rainClick}>
          {icon}
        </div>
        <div className='title'>Sprinklers</div>
      </div>
    )
  }

}

export default Navbar;
