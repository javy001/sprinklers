import React, { Component } from 'react';
import ContentCard from './ContentCard';
import '../styles/LogCard.css';

class LogCard extends Component {
  constructor() {
      super();
      this.state = {
        data: null,
        loaded: false
      };

  }
  componentDidMount() {
    fetch('http://10.0.0.252/sprinkler_service.php?name=logs')
      .then((results) => results.json())
      .then((responseJson) => {
        let rows = [];
        let i = 0;
        for (var row of responseJson) {
          rows.push(
            <tr key={i}>
              <td>{row.time}</td>
              <td>{row.func}</td>
              <td>{row.meta}</td>
            </tr>
          );
          i++;
        }
        let table = (
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Function</th>
                <th>Msg</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
        )
        this.setState({
          data: table,
          loaded: true
        });
      })
  }
  render() {
    if (this.state.loaded) {
      return (
        <ContentCard title='Logs' text={this.state.data}/>
      )
    } else {
      return (
        <ContentCard text={'...'}/>
      )
    }

  }
}

export default LogCard;
