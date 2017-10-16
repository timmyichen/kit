import React, { Component } from 'react';
import { Container, Header, Button } from 'semantic-ui-react';
import propTypes from 'prop-types';
import axios from 'axios';

import { getDataFrom } from '../actions/getDataFrom';
import MessageHeader from './MessageHeader';
import ConfirmActionModal from './ConfirmActionModal';

import { setMessage } from '../utils/messages';
import translateAPIerrors from '../utils/translateAPIerrors';

class PublicUserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      profile: null,
      loading: true,
      processingFriendRequest: false,
      friendRequestSent: false,
      isFriends: false,
      isBlocked: false,
      fetchDataInterval: null,
    };
    
    this.setMessage = setMessage.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.requestFriend = this.requestFriend.bind(this);
    this.handlePrimaryClick = this.handlePrimaryClick.bind(this);
  }
  componentDidMount() {
    this.fetchData();
    const id = setInterval(this.fetchData, 30000);
    this.setState({ fetchDataInterval: id });
  }
  componentWillUnmount() {
    clearInterval(this.state.fetchDataInterval);
  }
  fetchData() {
    const { username } = this.props.routerInfo.match.params;
    getDataFrom(`/api/user/profile/${username}`).then(profile => {
      getDataFrom('/api/current-user').then(user => {
        this.setState({
          profile,
          loading: false,
          friendRequestSent: this.checkIfRequested(profile, user),
          isFriends: this.checkIfFriends(profile, user),
          isBlocked: this.checkIfBlocked(profile, user),
        });
      });
    });
  }
  checkIfRequested(profile, user) {
    return user.requested.includes(profile._id);
  }
  checkIfFriends(profile, user) {
    return user.friends.includes(profile._id);
  }
  checkIfBlocked(profile, user) {
    return user.blocked.includes(profile._id);
  }
  requestFriend(action) {
    this.setState({ processingFriendRequest: true }, () => {
      const { profile } = this.state;
      const { _id, firstName, lastName } = profile;
      const fullName = `${firstName} ${lastName}`;
      axios.post(`/api/user/${action}`, { targetID: _id, name: `${fullName}` })
        .then(response => {
          if (response.data.success) {
            this.props.refreshUser();
            this.setState({
              processingFriendRequest: false,
              friendRequestSent: action === 'add',
              isBlocked: action === 'block',
            });
            const actionString = {
              add: `Requested ${fullName} as a friend`,
              remove: `Removed ${fullName} as a friend`,
              rescind: `Cancelled friend request to ${fullName}`,
              block: `Blocked ${fullName}`,
              unblock: `Unblocked ${fullName}`
            };
            this.setMessage({
              content: actionString[action],
              positive: true,
              duration: 4500
            });
          }
        }).catch(err => {
          this.setState({ processingFriendRequest: false });
          this.setMessage({
            content: `Error: ${translateAPIerrors(err.response.data.reason)}`,
            negative: true,
            duration: 4500
          });
        });
    });
  }
  handlePrimaryClick() {
    const { isFriends, friendRequestSent } = this.state;
    let action;
    if (isFriends) {
      action = 'remove';
    } else if (friendRequestSent) {
      action = 'rescind';
    } else {
      action = 'add';
    }
    this.requestFriend(action);
  }
  render() {
    const { loading, processingFriendRequest, friendRequestSent, isFriends, message, isBlocked, profile } = this.state;
    const { user } = this.props;
    if (loading) {
      return <Container></Container>;
    } else if (!this.state.profile || !this.props.user) {
      return <Container><Header as="h1">Profile Not Found</Header></Container>;
    }
    const { firstName, lastName, username } = profile;
    const fullName = `${firstName} ${lastName}`;
    return (
      <Container className="profile-page">
        <MessageHeader message={message} />
        <Header as="h1">{firstName} {lastName}</Header>
        <Header as="h3" className="subtitle">{username}</Header>
        <Button primary
          disabled={user.username === username || processingFriendRequest || isBlocked}
          content={isFriends ? 'Remove Friend' : '' || friendRequestSent ? 'Cancel Friend Request' : 'Add Friend'}
          icon={isFriends || friendRequestSent ? 'remove user' : 'add user'}
          labelPosition="right"
          onClick={this.handlePrimaryClick}
        />
        <ConfirmActionModal
          triggerProps={{secondary: true, labelPosition: 'right'}}
          triggerText={isBlocked ? 'Unblock' : 'Block'}
          triggerIcon="ban"
          action={`${isBlocked ? 'unblock' : 'block'} ${fullName}`}
          reversible={true}
          onConfirm={() => this.requestFriend(isBlocked ? 'unblock' : 'block')}
        />
      </Container>
    );
  }
}

PublicUserProfile.propTypes = {
  user: propTypes.object,
  refreshUser: propTypes.func.isRequired,
  routerInfo: propTypes.object.isRequired,
};

export default PublicUserProfile;