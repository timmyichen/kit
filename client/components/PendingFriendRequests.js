import React, { Component } from 'react';
import { Header, Container, Card } from 'semantic-ui-react';
import propTypes from 'prop-types';

import FriendRequest from './FriendRequest';
import { getDataFrom } from '../actions/getDataFrom';

class PendingFriendRequests extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pendingRequests: null,
      refreshReqsIntervalID: null,
      message: null,
      messageTimeoutID: null,
    };
    
    this.refreshRequests = this.refreshRequests.bind(this);
  }
  componentDidMount() {
    this.refreshRequests();
  }
  refreshRequests() {
    getDataFrom('/api/user/pending-requests')
      .then(response => {
        const pendingRequests = Array.isArray(response) && response.length === 0 ? null : response;
        this.setState({ pendingRequests });
      });
  }
  render() {
    const { user, refreshUser, setMessage } = this.props;
    const { message, pendingRequests } = this.state;
    return (
      <Container>
        <div className="alert-container">{message}</div>
        <Header as="h2">Pending Friend Requests</Header>
        {pendingRequests ? 
          <Card.Group itemsPerRow={4}>
            {pendingRequests.map((req, i) => 
              <FriendRequest
                key={`friendreq-${i}`}
                user={user}
                refreshUser={refreshUser}
                refreshRequests={this.refreshRequests}
                req={req}
                setMessage={setMessage}
              />
            )}
          </Card.Group>
        : <p>You have no pending friend requests at this time.</p>}
      </Container>
    );
  }
}

PendingFriendRequests.propTypes = {
  user: propTypes.object,
  refreshUser: propTypes.func.isRequired,
};

export default PendingFriendRequests;