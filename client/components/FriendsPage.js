import React, { Component } from 'react';
import { Container, Header } from 'semantic-ui-react';
import propTypes from 'prop-types';

import MessageHeader from './MessageHeader';
import FriendListing from './FriendListing';

import { getDataFrom } from '../actions/getDataFrom';

class FriendsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      friends: {},
      allInfos: []
    };
    
    this.loadDataToState = this.loadDataToState.bind(this);
  }
  componentDidMount() {
    this.loadDataToState();
  }
  loadDataToState() {
    const getFriendsList = getDataFrom('/api/user/friends-list');
    const getMyInfo = getDataFrom('/api/my-info');
    Promise.all([getFriendsList, getMyInfo])
      .then(values => {
        const friends = values[0].reduce((obj, friend) => {
          obj[friend._id] = friend;
          obj[friend._id].infosShared = [];
          return obj;
        }, {});
        values[1].map(info => {
          info.sharedWith.forEach(user => {
            friends[user].infosShared.push(info);
          });
        });
        this.setState({ friends, allInfos: values[1] });
      });
  }
  render() {
    const { message, friends, allInfos } = this.state;
    return (
      <Container>
        <MessageHeader message={message} />
        <Header as="h1">My Friends</Header>
        {Object.values(friends).map(friend => 
          <FriendListing
            key={`friend-${friend.username}`}
            info={friend}
            allInfos={allInfos}
            setMessage={this.props.setMessage}
            refreshData={this.loadDataToState}
          />
        )}
      </Container>
    );
  }
}

FriendsPage.propTypes = {
  
};

export default FriendsPage;