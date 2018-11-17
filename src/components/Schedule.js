import React, { Component } from 'react';
import { Edit2 } from 'react-feather';
import ContentCard from './ContentCard';

class Schedule extends Component {
  constructor() {
      super();
      this.state = {
        data: null,
        loaded: false,
        edit: false
      };
      this.editClick = this.editClick.bind(this);
      this.submitClick = this.submitClick.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleDays = this.handleDays.bind(this);
      this.checked = this.checked.bind(this);
  }

  componentDidMount() {
    fetch('http://10.0.0.252/sprinkler_service.php?name=schedule')
      .then((results) => results.json())
      .then((responseJson) => {
        this.setState({
          data: responseJson,
          loaded: true,
        });
      })
  }

  editClick() {
    this.setState({edit: true});
  }

  submitClick() {
    fetch('http://10.0.0.252/sprinkler_service.php', {
      method: 'POST',
      body: JSON.stringify({
        name: 'start_time',
        start_time: this.state.data.start_time,
        days: this.state.data.days,
        program: this.state.data.program
      }),
      headers: {
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

    this.setState({edit: false});
  }

  handleChange(event) {
    let name = event.target.name;
    let state = this.state.data;
    state[name] = event.target.value;
    this.setState({data: state});
  }

  handleDays(event) {
    let days = {};
    for (var val of this.state.data.days) {
      days[val] = true;
    }
    let stateDays = []
    days[event.target.name] = event.target.checked;
    for(var k in days) {
      if(days[k] === true) {
        stateDays.push(k);
      }
    }
    let state = this.state.data;
    state.days = stateDays;
    this.setState({data: state});
    console.log(state.days);
  }

  checked(name) {
    for(var v of this.state.data.days) {
      if (v === name) {
        return true;
      }
    }
    return false;
  }
  render() {
    if (this.state.edit) {
      let dayArr = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      let days = [];
      for(var v of dayArr){
        days.push(<Checkbox key={v} name={v} checked={this.checked(v)} changeFunc={this.handleDays} />)
      }
      let text =
      <div>
        <div>
          Start time: <input name='start_time'
            value={this.state.data.start_time}
            onChange={this.handleChange}
          />
        </div>
        <div name='days'>
          {days}
        </div>
      </div>
      ;
      return(
        <ContentCard
          text={text}
          title={'Program ' + this.state.data.program}
          footer={<button type='button' onClick={this.submitClick}>Submit</button>}
        />
      );
    }
    if (this.state.loaded) {
      let sprinklers = [];
      let i = 0;
      for (var k in this.state.data.sprinkler) {
        sprinklers.push(
          <div key={i}>
            {k}: {this.state.data.sprinkler[k]} minutes
          </div>
        )
        i++;
      }
      let short_days = {
        Monday: 'M',
        Tuesday: 'T',
        Wednesday: 'W',
        Thursday: 'Th',
        Friday: 'F',
        Saturday: 'Sat',
        Sunday: 'Sun'
      }
      let days = '';
      for (var d of this.state.data['days']) {
        days += short_days[d] + ' ';
      }
      let day_div = <div>{days}</div>

      let text = (
        <div>
          <div>
            {day_div}
          </div>
          <div>
            Start time: {this.state.data.start_time}
          </div>
          {sprinklers}
        </div>

      )
      return (
        <ContentCard text={text}
          title={'Program ' + this.state.data.program}
          footer={<Edit2 size={15} onClick={this.editClick}/>}
        />
      );
    } else {
      return (
        <div> waiting... </div>
      )
    }

  }
}

class Checkbox extends Component {
  render() {
    return (
      <div>
        <input type='checkbox'
          checked={this.props.checked}
          name={this.props.name}
          onChange={this.props.changeFunc}
        /> {this.props.name}
      </div>

    );
  }
}

export default Schedule;
