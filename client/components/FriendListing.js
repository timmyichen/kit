import React, { Component } from 'react';
import { Card, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';
import moment from 'moment';

import FriendSharingModal from './FriendSharingModal';

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
    const { firstName, lastName, username, birthday, lastActive, infosShared, _id } = this.props.info;
    const { allInfos, setMessage, refreshData } = this.props;
    const lastActiveMoment = moment(lastActive);
    const nextBirthday = getNextDate(birthday);
    const bdayDiff = getDateDifference(nextBirthday);
    return (
      <Card fluid color="blue">
        <Card.Content>
          <Card.Header><Link to={`/profile/${username}`}>{`${firstName} ${lastName}`}</Link></Card.Header>
          <Card.Meta>{username} last logged in on {lastActiveMoment.format("MMM Do, YYYY")}</Card.Meta>
          {infosShared.length === 0 ? `You have not shared any contact information with ${firstName} yet.` :
            `You have shared ${pluralize(infosShared.length, 'piece')} of contact information with with ${firstName}.`
          }
          {infosShared.map((info, i) => (
            <div className="tabbed" key={`${info._id}${_id}${i}`}>
              '{info.label}' ({info.primary ? 'primary ' : ''}{info.type})
            </div>
          ))}
          <FriendSharingModal
            friend={this.props.info}
            allInfos={allInfos}
            setMessage={setMessage}
            refreshData={refreshData}
          />
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
  setMessage: propTypes.func.isRequired,
  refreshData: propTypes.func.isRequired,
};

export default FriendListing;