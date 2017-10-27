import React, { Component } from 'react';
import { Icon, Divider, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import moment from 'moment';

import FriendSharingModal from './FriendSharingModal';

import { getNextDate, getDateDifference } from '../utils/dates';
import { pluralize } from '../utils/strings';

const dataTypes = [
  { name: 'phone', icon: 'phone' },
  { name: 'email', icon: 'mail' },
  { name: 'address', icon: 'home' },
];

const transitionStyles = {
  entering: { opacity: 0 },
  entered: { opacity: 1 },
  exiting: { opacity: 1 },
  exited: { opacity: 0 },
};

class FriendListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
    this.toggleMore = this.toggleMore.bind(this);
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
  getPrimary(sharedWithUser, type) {
    const primaryEntry = sharedWithUser.filter(info => info.type === type && info.primary);
    if (primaryEntry.length === 0){
      return `No primary ${type} found.`;
    }
    const data = primaryEntry[0].data;
    switch(type) {
      case 'email':
        return data.address;
      case 'phone':
        return `${data.countryCode ? data.countryCode + ' ' : ''}${data.number}`;
      case 'address':
        return <span>{data.streetAddress} {data.unitNumber}<br/>{data.citySubdivision}<br/>{data.country}</span>
    }
  }
  toggleMore() {
    const showMore = !this.state.showMore;
    this.setState({ showMore });
  }
  render() {
    const { showMore } = this.state;
    const { allInfos, info, setMessage, refreshData } = this.props;
    const { firstName, fullName, username, birthday, lastActive, sharedWithFriend, sharedWithUser, _id } = info;
    const lastActiveMoment = moment(lastActive);
    const nextBirthday = getNextDate(birthday);
    const bdayDiff = getDateDifference(nextBirthday);
    return (
      <div className='friend-card'>
        <div className='primary-info'>
          <div className="left">
            <div className="name">
              <Link to={`/profile/${username}`}><h3>{fullName}</h3></Link>
              <p>{username}</p>
            </div>
            <div className="extras">
              <p>Last Active: {lastActiveMoment.format("MMM Do, YYYY")}</p>
              <p>
                {sharedWithFriend.length === 0 ? `Nothing shared with ${firstName} yet.` :
                  `${pluralize(sharedWithFriend.length, 'item')} shared with ${firstName}.`
                }
              </p>
              <FriendSharingModal
                friend={this.props.info}
                allInfos={allInfos}
                setMessage={setMessage}
                refreshData={refreshData}
              />
            </div>
          </div>
          <div className="right">
            <table>
              <tbody>
                {dataTypes.map(type => (
                  <tr key={`${username}-type-${type.name}`}>
                    <td><Icon name={type.icon} size="large" /></td>
                    <td>{this.getPrimary(sharedWithUser, type.name)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Transition in={showMore} timeout={200}>
          {(state) => (
            <div
              className={showMore ? 'toggle' : 'toggle hidden'}
              style={{ opacity: 0, transition: 'opacity 200ms ease-in-out',
                ...transitionStyles[state] }}
            >
              <Divider />
                <div className="more-info">
                  more info!
                </div>
            </div>
          )}
        </Transition>
        <Divider />
        <div className='more'>
          <a onClick={this.toggleMore}>{showMore ? 'Less' : 'More' }</a>
        </div>
      </div>
    );
  }
  // render() {
  //   const { firstName, lastName, username, birthday, lastActive, infosShared, _id } = this.props.info;
  //   const { allInfos, setMessage, refreshData } = this.props;
  //   const lastActiveMoment = moment(lastActive);
  //   const nextBirthday = getNextDate(birthday);
  //   const bdayDiff = getDateDifference(nextBirthday);
  //   return (
  //     <Card fluid color="blue">
  //       <Card.Content>
  //         <Card.Header><Link to={`/profile/${username}`}>{`${firstName} ${lastName}`}</Link></Card.Header>
  //         <Card.Meta>{username} last logged in on {lastActiveMoment.format("MMM Do, YYYY")}</Card.Meta>
  //         {infosShared.length === 0 ? `You have not shared any contact information with ${firstName} yet.` :
  //           `You have shared ${pluralize(infosShared.length, 'piece')} of contact information with with ${firstName}.`
  //         }
  //         {infosShared.map((info, i) => (
  //           <div className="tabbed" key={`${info._id}${_id}${i}`}>
  //             '{info.label}' ({info.primary ? 'primary ' : ''}{info.type})
  //           </div>
  //         ))}
  //         <FriendSharingModal
  //           friend={this.props.info}
  //           allInfos={allInfos}
  //           setMessage={setMessage}
  //           refreshData={refreshData}
  //         />
  //       </Card.Content>
  //       <Card.Content extra>
  //         Upcoming Birthday: {moment(nextBirthday).format("MMM Do YYYY")} ({this.getDifferenceString(bdayDiff)})
  //       </Card.Content>
  //     </Card>
  //   );
  // }
}

FriendListing.propTypes = {
  info: propTypes.object.isRequired,
  setMessage: propTypes.func.isRequired,
  refreshData: propTypes.func.isRequired,
};

export default FriendListing;