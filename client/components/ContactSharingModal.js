import React, { Component } from 'react';
import { Modal, List, Button } from 'semantic-ui-react';
import propTypes from 'prop-types';
import axios from 'axios';

import FriendSharingListing from './FriendSharingListing';

import { getDataFrom } from '../actions/getDataFrom';
import translateAPIerrors from '../utils/translateAPIerrors';

const postHeader = require('../utils/misc').getCsrfPostHeader();

class ContactSharingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      friends: null,
      friendsShared: [],
    };
    
    this.loadDataToState = this.loadDataToState.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.onClose = this.onClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.saveData = this.saveData.bind(this);
    this.renderFriendListings = this.renderFriendListings.bind(this);
  }
  loadDataToState() {
    getDataFrom('/api/user/friends-list')
      .then(response => {
        this.setState({ friends: response });
      });
  }
  onOpen() {
    this.loadDataToState();
    this.setState({ open: true, friendsShared: this.props.info.sharedWith });
  }
  onClose() {
    this.setState({ open: false });
  }
  handleChange(checked, friend) {
    let { friendsShared } = this.state;
    if (checked) {
      friendsShared.push(friend._id);
    } else {
      friendsShared = friendsShared.filter(id => id !== friend._id);
    }
    this.setState({ friendsShared });
  }
  saveData() {
    const { setMessage, updateInfo } = this.props;
    const { label } = this.props.info;
    axios.post('/api/share/by-contact', {
      sharedWith: this.state.friendsShared,
      contactID: this.props.info._id,
    }, postHeader).then(res => {
      if (res.status === 200) {
        setMessage({
          content: `Success: saved sharing permissions for '${label}'`,
          positive: true,
          duration: 4000,
        });
        updateInfo();
        this.onClose();
      }
    }).catch(err => {
      this.setMessage({
        content: `Error: ${translateAPIerrors(err.response.data.reason)}`,
        negative: true,
        duration: 4500,
      });
    });
  }
  renderFriendListings() {
    const { friends, friendsShared } = this.state;
    if (!friends) return '';
    return friends.map(friend =>
      <FriendSharingListing
        key={`friend-${friend.username}`}
        friend={friend}
        handleChange={this.handleChange}
        checked={friendsShared.includes(friend._id)}
      />
    );
  }
  render() {
    const { type, label } = this.props.info;
    const { open } = this.state;
    return (
      <Modal
        open={open}
        trigger={<a>Manage Sharing Settings</a>}
        size="small"
        closeOnDimmerClick={false}
        closeIcon={true}
        onClose={this.onClose}
        onOpen={this.onOpen}
      >
        <Modal.Header>Share your {type} '{label}' with your friends:</Modal.Header>
        <Modal.Content>
          <div className="ui list">
            {this.renderFriendListings()}
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button negative content="Cancel" onClick={this.onClose} />
          <Button positive content="Save" onClick={this.saveData} />
        </Modal.Actions>
      </Modal>
    );
  }
}

ContactSharingModal.propTypes = {
  user: propTypes.object,
  info: propTypes.object.isRequired,
  setMessage: propTypes.func.isRequired,
  updateInfo: propTypes.func.isRequired,
};

export default ContactSharingModal;