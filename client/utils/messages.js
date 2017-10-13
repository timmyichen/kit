import React from 'react';

import AlertMessage from '../components/AlertMessage';

function setMessage({header='', content='', positive=false, negative=false, duration=4500}) {
  const message = (
    <AlertMessage
      content={content}
      header={header}
      positive={positive}
      negative={negative}
      duration={duration}
    />
  );
  
  const messageTimeoutID = setTimeout(() => this.setState({ message: null }), duration+500);
  clearTimeout(this.state.messageTimeoutID); //to clear any other messages waiting to timeout
  
  this.setState({ message, messageTimeoutID });
}

module.exports = {
  setMessage,
}