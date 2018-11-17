import React, { Component } from 'react';
import '../styles/ContentCard.css'

class ContentCard extends Component {
render(){
  return (
    <div className='card'>
      <div className='header'>
        {this.props.title}
      </div>
      <div className='body'>
        {this.props.text}
      </div>
      <div className='footer'>
        {this.props.footer}
      </div>
    </div>
  )
}

}

export default ContentCard;
