import React, { Component } from 'react';
import { Container, Header } from 'semantic-ui-react';
import propTypes from 'prop-types';

import MessageHeader from './MessageHeader';
import FriendListing from './FriendListing';

import { setMessage } from '../utils/messages';
import { getDataFrom } from '../actions/getDataFrom';

class FriendsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      friends: [],
      message: null,
    };
    
    this.setMessage = setMessage.bind(this);
    this.loadDataToState = this.loadDataToState.bind(this);
  }
  componentDidMount() {
    this.loadDataToState();
  }
  loadDataToState() {
    getDataFrom('/api/user/friends-list')
      .then(response => {
        this.setState({ friends: response });
      });
  }
  render() {
    const { message, friends } = this.state;
    return (
      <Container>
        <MessageHeader message={message} />
        <Header as="h1">My Friends</Header>
        {friends.map(friend => <FriendListing key={`friend-${friend.username}`} info={friend} />)}
      </Container>
    )
  }
}

FriendsPage.propTypes = {
  
};

export default FriendsPage;