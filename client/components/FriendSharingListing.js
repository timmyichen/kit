import React, { Component } from 'react';
import { List, Checkbox, Divider } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';

class FriendSharingListing extends Component {
  render() {
    const { friend, handleChange, checked } = this.props;
    const { firstName, lastName, username } = friend;
    const fullName = firstName + ' ' + lastName;
    return (
      <List.Item>
        <List.Content>
          <List.Header className="split-half">
            <Link to={`/profile/${username}`}>{fullName} ({username})</Link>
            <span>Not shared <Checkbox checked={checked} toggle onChange={(e,d) => handleChange(d.checked, friend)} /> Shared</span>
          </List.Header>
          <Divider />
        </List.Content>
      </List.Item>
    );
  }
}

FriendSharingListing.propTypes = {
  friend: propTypes.object.isRequired,
  handleChange: propTypes.func.isRequired,
  checked: propTypes.bool.isRequired,
};

export default FriendSharingListing;