import React, { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';
import axios from 'axios';

const postHeaders = require('../utils/misc').getCsrfPostHeader();

class PendingFriendRequests extends Component {
  constructor(props) {
    super(props);
    
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(action) {
    const { req, refreshUser, setMessage, refreshRequests } = this.props;
    const pastTense = { accept: 'accepted', decline: 'declined' };
    axios.post(`/api/user/${action}-friend`, { targetID: req._id }, postHeaders)
      .then(response => {
        const { success, reason } = response.data;
        const params = {};
        params.content = success ? `Success: ${pastTense[action]} ${req.firstName} ${req.lastName}'s friend request`
          : `Error: ${reason}: Try again later.`;
        const buttonType = success ? action === 'accept' ? 'positive' : '' : 'negative';
        params[buttonType] = true;
        params.duration = success ? 3500 : 5000;
        setMessage(params);
        refreshUser();
        refreshRequests();
      });
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
            <Button basic color="green" onClick={() => this.handleClick('accept')}>Accept</Button>
            <Button basic color="red" onClick={() => this.handleClick('decline')}>Decline</Button>
          </div>
        </Card.Content>
      </Card>
    );
  }
}

export default PendingFriendRequests;