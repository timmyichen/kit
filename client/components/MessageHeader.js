import React, { Component } from 'react';
import propTypes from 'prop-types';

class MessageHeader extends Component {
  render() {
    return <div className="alert-container">{this.props.message}</div>;
  }
}

MessageHeader.propTypes = {
  message: propTypes.element,
};

export default MessageHeader;