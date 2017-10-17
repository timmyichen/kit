import React, { Component } from 'react';
import { Header, Container, Divider } from 'semantic-ui-react';
import propTypes from 'prop-types';

import PendingFriendRequests from './PendingFriendRequests';
import UpcomingBirthdays from './UpcomingBirthdays';
import MessageHeader from './MessageHeader';

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
        <MessageHeader message={message} />
        <Header as="h1">Dashboard</Header>
        <PendingFriendRequests
          user={user}
          refreshUser={refreshUser}
          setMessage={this.setMessage}
        />
        <Divider />
        <UpcomingBirthdays
          user={user}
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