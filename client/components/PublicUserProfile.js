import React, { Component } from 'react';
import { Container, Header, Button } from 'semantic-ui-react';
import propTypes from 'prop-types';
import axios from 'axios';

import getProfile from '../actions/getProfile';
import getUser from '../actions/getUser';

class PublicUserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: null,
      loading: true,
      processingFriendRequest: false,
      friendRequestSent: false,
    };
    
    this.fetchInitialData = this.fetchInitialData.bind(this);
    this.checkIfRequested = this.checkIfRequested.bind(this);
    this.requestFriend = this.requestFriend.bind(this);
    this.block = this.block.bind(this);
    this.unblock = this.unblock.bind(this);
  }
  componentDidMount() {
    this.fetchInitialData();
  }
  fetchInitialData() {
    const { username } = this.props.routerInfo.match.params;
    getProfile(username).then(profile => {
      getUser().then(user => {
        this.setState({
          profile,
          loading: false,
          friendRequestSent: this.checkIfRequested(profile, user),
        });
      });
    });
  }
  checkIfRequested(profile, user) {
    return user.requested.includes(profile._id);
  }
  requestFriend(action) {
    this.setState({ processingFriendRequest: true }, () => {
      const { _id, firstName, lastName } = this.state.profile;
      axios.post(`/api/user/${action}`, { targetID: _id, name: `${firstName} ${lastName}` })
        .then(response => {
          if (response.data.success) {
            this.props.refreshUser();
            this.setState({ processingFriendRequest: false, friendRequestSent: action === 'add' });
          }
        });
    });
  }
  block() {
    
  }
  unblock() {
    
  }
  render() {
    const { loading, processingFriendRequest, friendRequestSent } = this.state;
    const { user } = this.props;
    if (loading) {
      return <Container></Container>;
    } else if (!this.state.profile || !this.props.user) {
      return <Container><Header as="h1">Profile Not Found</Header></Container>;
    }
    const { firstName, lastName, username } = this.state.profile;
    return (
      <Container className="profile-page">
        <Header as="h1">{firstName} {lastName}</Header>
        <Header as="h3" className="subtitle">{username}</Header>
        <Button primary
          disabled={user.username === username || processingFriendRequest}
          content={friendRequestSent ? 'Cancel Friend Request' : 'Add Friend'}
          icon="add user"
          labelPosition="right"
          onClick={friendRequestSent ? () => this.requestFriend('rescind') : () => this.requestFriend('add')}
        />
        <Button secondary
          disabled={user.username === username}
          content="Block"
          icon="ban"
          labelPosition="right"
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