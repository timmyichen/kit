import React, { Component } from 'react';
import { Card, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';
import moment from 'moment';

class FriendListing extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { firstName, lastName, username, birthday, lastLogin } = this.props.info;
    const lastLoginMoment = moment(lastLogin);
    const birthdayMoment = moment(birthday.substring(4));
    return (
      <Card fluid color="blue">
        <Card.Content>
          <Card.Header><Link to={`/profile/${username}`}>{`${firstName} ${lastName}`}</Link></Card.Header>
          <Card.Meta>{username} last logged in on {lastLoginMoment.format("MMM Do, YYYY")}</Card.Meta>
          {firstName} has shared the following info with you:
        </Card.Content>
        <Card.Content extra>
          Birthday: {moment(birthday).format("MMM Do")}
        </Card.Content>
      </Card>
    );
  }
}

FriendListing.propTypes = {
  info: propTypes.object.isRequired,
};

export default FriendListing;