import React, { Component } from 'react';
import { Card, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';
import moment from 'moment';

import { getNextDate, getDateDifference } from '../utils/dates';
import { pluralize } from '../utils/strings';

window.moment = moment;

class FriendListing extends Component {
  constructor(props) {
    super(props);
  }
  getDifferenceString(diff) {
    if (diff.days === 0) {
      return 'That\'s today!';
    } else if (diff.days > 31) {
      return `${pluralize(diff.months, 'month')} away`;
    } else {
      return `${pluralize(diff.days, 'day')} away`;
    }
  }
  render() {
    const { firstName, lastName, username, birthday, lastActive, infos } = this.props.info;
    const lastActiveMoment = moment(lastActive);
    const nextBirthday = getNextDate(birthday);
    const bdayDiff = getDateDifference(nextBirthday);
    return (
      <Card fluid color="blue">
        <Card.Content>
          <Card.Header><Link to={`/profile/${username}`}>{`${firstName} ${lastName}`}</Link></Card.Header>
          <Card.Meta>{username} last logged in on {lastActiveMoment.format("MMM Do, YYYY")}</Card.Meta>
          {infos.length === 0 ? `${firstName} has not shared any info with you yet.` :
            `${firstName} has shared ${infos.length} pieces of contact information with you:`
          }
        </Card.Content>
        <Card.Content extra>
          Upcoming Birthday: {moment(nextBirthday).format("MMM Do YYYY")} ({this.getDifferenceString(bdayDiff)})
        </Card.Content>
      </Card>
    );
  }
}

FriendListing.propTypes = {
  info: propTypes.object.isRequired,
};

export default FriendListing;