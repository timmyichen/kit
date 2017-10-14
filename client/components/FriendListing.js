import React, { Component } from 'react';
import { Card, Icon } from 'semantic-ui-react';
import propTypes from 'prop-types';

class FriendListing extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { firstName, lastName, username, birthday, lastLogin } = this.props.info;
    return (
      <Card fluid color="blue">
        <Card.Content>
          <Card.Header>{`${firstName} ${lastName}`}</Card.Header>
          <Card.Meta>{username}</Card.Meta>
          {firstName} has shared the following info with you:
        </Card.Content>
        <Card.Content extra>
          Birthday: {birthday}
        </Card.Content>
      </Card>
    );
  }
}

FriendListing.propTypes = {
  info: propTypes.object.isRequired,
};

export default FriendListing;