import React, { Component } from 'react';
import { Container, Header, Input } from 'semantic-ui-react';
import propTypes from 'prop-types';

import MessageHeader from './MessageHeader';
import FriendListing from './FriendListing';

import { getDataFrom } from '../actions/getDataFrom';

class FriendsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      visibleFriends: [],
    }
    this.updateInfo = this.updateInfo.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }
  componentDidMount() {
    this.updateInfo(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.updateInfo(nextProps);
  }
  updateInfo(props) {
    const { query } = this.state;
    const { friends } = props;
    this.setState({ visibleFriends: this.filterFriends(friends, query) });
  }
  filterFriends(friends, query) {
    if (query === '') return Object.values(friends);
    const re = new RegExp(query, 'i');
    return Object.values(friends).filter(friend => re.test(friend.username) || re.test(friend.fullName));
  }
  handleSearch(event, data) {
    const query = data.value;
    const { friends } = this.props;
    this.setState({
      query,
      visibleFriends: this.filterFriends(friends, query)
    })
  }
  render() {
    const { visibleFriends, query } = this.state;
    const { setMessage, allInfos, refreshData } = this.props;
    return (
      <Container id='friends-page'>
        <Header as="h1">My Friends</Header>
        <Input fluid
          icon="search"
          placeholder="Search by name or username.."
          onChange={this.handleSearch}
          value={query}
        />
        {visibleFriends.map(friend => 
          <FriendListing
            key={`friend-${friend.username}`}
            info={friend}
            allInfos={allInfos}
            setMessage={setMessage}
            refreshData={refreshData}
          />
        )}
      </Container>
    );
  }
}

FriendsPage.propTypes = {
  
};

export default FriendsPage;