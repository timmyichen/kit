import React, { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';
import axios from 'axios';

class PendingFriendRequests extends Component {
  constructor(props) {
    super(props);
    
    this.acceptRequest = this.acceptRequest.bind(this);
  }
  acceptRequest() {
    const { req, refreshUser, setMessage, refreshRequests } = this.props;
    axios.post('/api/user/accept-friend', { targetID: req._id })
      .then(response => {
        const { success, reason } = response.data;
        const params = {};
        params.content = success ? `Success: accepted ${req.firstName} ${req.lastName}'s friend request`
          : `Error: ${reason}: Try again later.`;
        params[success ? 'positive' : 'negative'] = true;
        params.duration = success ? 3500 : 5000;
        setMessage(params);
        refreshUser();
        refreshRequests();
      });
  }
  declineRequest() {
    
  }
  render() {
    const { firstName, lastName, username } = this.props.req;
    return (
      <Card>
        <Card.Content>
          <Card.Header>{firstName} {lastName}</Card.Header>
          <Card.Meta>{username}</Card.Meta>
          <Card.Description>{firstName} wants to be your friend! This will allow you to share specific contact information with {firstName}.</Card.Description>
        </Card.Content>
        <Card.Content extra>
          <div className="ui two buttons">
            <Button basic color="green" onClick={this.acceptRequest}>Accept</Button>
            <Button basic color="red">Decline</Button>
          </div>
        </Card.Content>
      </Card>
    );
  }
}

export default PendingFriendRequests;