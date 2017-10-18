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
      friends: {},
      message: null,
    };
    
    this.setMessage = setMessage.bind(this);
    this.loadDataToState = this.loadDataToState.bind(this);
  }
  componentDidMount() {
    this.loadDataToState();
  }
  loadDataToState() {
    const getFriendsList = getDataFrom('/api/user/friends-list');
    const getContacts = getDataFrom('/api/contacts');
    Promise.all([getFriendsList, getContacts])
      .then(values => {
        const friends = values[0].reduce((obj, friend) => {
          obj[friend._id] = friend;
          obj[friend._id].infos = [];
          return obj;
        }, {});
        values[1].infos.map(info => {
          friends[info.owner].infos.push(info);
        })
        this.setState({ friends });
      })
  }
  render() {
    const { message, friends } = this.state;
    return (
      <Container>
        <MessageHeader message={message} />
        <Header as="h1">My Friends</Header>
        {Object.values(friends).map(friend => <FriendListing key={`friend-${friend.username}`} info={friend} />)}
      </Container>
    )
  }
}

FriendsPage.propTypes = {
  
};

export default FriendsPage;