import React, { Component } from 'react';
import { Message } from 'semantic-ui-react';
import propTypes from 'prop-types';

class AlertMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }
  componentDidMount() {
    const { duration } = this.props;
    this.setState({ visible: true }, () => {
      setTimeout(() => {this.setState({ visible: false })}, duration);
    });
  }
  render() {
    const { header, content, positive, negative } = this.props;
    const { visible } = this.state;
    return (
      <div className={visible ? 'alert' : 'alert hidden'}>
        <Message
          floating
          positive={positive}
          negative={negative}
          style={{ left: '-50%' }}
        >
          <Message.Header>{header}</Message.Header>
          <p>{content}</p>
        </Message>
      </div>
    );
  }
}

AlertMessage.propTypes = {
  duration: propTypes.number.isRequired,
  header: propTypes.string,
  content: propTypes.string,
  positive: propTypes.bool,
  negative: propTypes.bool,
};

export default AlertMessage;