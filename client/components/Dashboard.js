import React, { Component } from 'react';
import { Header, Container } from 'semantic-ui-react';
import propTypes from 'prop-types';

import PendingFriendRequests from './PendingFriendRequests';

import { setMessage } from '../utils/messages';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      messageTimeoutID: null,
    }
    this.setMessage = setMessage.bind(this);
  }
  render() {
    const { user, refreshUser } = this.props;
    const { message } = this.state;
    return (
      <Container>
        <div className="alert-container">{message}</div>
        <Header as="h1">Dashboard</Header>
        <PendingFriendRequests
          user={user}
          refreshUser={refreshUser}
          setMessage={this.setMessage}
        />
      </Container>
    );
  }
}

Dashboard.propTypes = {
  user: propTypes.object,
  refreshUser: propTypes.func.isRequired,
}

export default Dashboard;