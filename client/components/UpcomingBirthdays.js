import React, { Component } from 'react';
import { Header, Container, List, Dropdown, Icon } from 'semantic-ui-react';
import propTypes from 'prop-types';
import moment from 'moment';

import { getNextDate, getDateDifference } from '../utils/dates';
import { getDataFrom } from '../actions/getDataFrom';
import { pluralize } from '../utils/strings';

const showValues = [5, 10, 25, 'All'];

class UpcomingBirthdays extends Component {
  constructor(props) {
    super(props);
    this.state = {
      friends: [],
      reloadIntervalID: 0,
      showQuantity: 5,
    };
    
    this.loadDataToState = this.loadDataToState.bind(this);
    this.changeShowQuantity = this.changeShowQuantity.bind(this);
  }
  componentDidMount() {
    this.loadDataToState();
    this.setState({ reloadIntervalID: setInterval(this.loadDataToState, 3600000) }); //1 hour
  }
  componentWillUnmount() {
    clearInterval(this.state.reloadIntervalID);
  }
  getDifferenceString(diff) {
    if (diff.days === 0) {
      return <span>Today! <Icon name="birthday" color="blue" /></span>;
    } else if (diff.days > 31) {
      return `${pluralize(diff.months, 'month')} away`;
    } else {
      return `${pluralize(diff.days, 'day')} away`;
    }
  }
  loadDataToState() {
    getDataFrom('/api/user/friends-list')
      .then(values => {
        const friends = values.map(friend => {
          const nextBirthday = getNextDate(friend.birthday);
          const bdayDiff = getDateDifference(nextBirthday);
          friend.nextBirthday = nextBirthday;
          friend.birthdayString = moment(nextBirthday).format("MMM Do YYYY");
          friend.birthdayDiffString = this.getDifferenceString(bdayDiff);
          return friend;
        })
        friends.sort((a,b) => {
          return a.nextBirthday > b.nextBirthday;
        });
        this.setState({ friends });
      });
  }
  changeShowQuantity(event, data) {
    this.setState({ showQuantity: data.value })
  }
  render() {
    const { friends } = this.state;
    const showQuantity = this.state.showQuantity === 'All' ? friends.length : this.state.showQuantity;
    return (
      <Container id="upcoming-birthdays">
        <Header as="h2">Upcoming Birthdays</Header>
        Show <span className="dropdown select"><Dropdown simple item
          text={showQuantity + ''}
          options={showValues.map((q, i) => ({key: i, text: q + '', value: q}))}
          onChange={this.changeShowQuantity}
        /></span> upcoming birthdays.
        <List>
          {friends.slice(0,showQuantity).map(friend => (
            <List.Item key={`birthday-${friend.username}`}>
              <List.Content>
                <List.Header>{friend.fullName}</List.Header>
                <List.Description>{friend.birthdayString} ({friend.birthdayDiffString})</List.Description>
              </List.Content>
            </List.Item>
          ))}
        </List>
      </Container>
    );
  }
}

UpcomingBirthdays.propTypes = {
  user: propTypes.object
};

export default UpcomingBirthdays;