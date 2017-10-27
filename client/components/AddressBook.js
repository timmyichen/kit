import React, { Component } from 'react';
import { Container, Card, Tab } from 'semantic-ui-react';
import propTypes from 'prop-types';

import MessageHeader from './MessageHeader';
import SharedInfoCard from './SharedInfoCard';
import FriendsPage from './FriendsPage';
import FriendSearch from './FriendSearch';

import { setMessage } from '../utils/messages';
import { getDataFrom } from '../actions/getDataFrom';



class AddressBook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      messageTimeoutID: null,
      friends: {},
      allInfos: [],
      tabs: [
        { menuItem: 'My Friends', render: () => (
          <Tab.Pane>
            <FriendsPage
              setMessage={this.setMessage}
              user={props.user}
              refreshUser={props.refreshUser}
              friends={this.state.friends}
              allInfos={this.state.allInfos}
              refreshData={this.loadDataToState}
            />
          </Tab.Pane>
        ) },
        { menuItem: 'My Groups', render: () => (<Tab.Pane>b</Tab.Pane>) },
        { menuItem: 'Find Friends', render: () => (
          <Tab.Pane>
            <FriendSearch
              setMessage={this.setMessage}
            />
          </Tab.Pane>
        ) },
      ],
    };
    
    this.setMessage = setMessage.bind(this);
    this.loadDataToState = this.loadDataToState.bind(this);
  }
  componentDidMount() {
    this.loadDataToState();
  }
  loadDataToState() {
    const getFriendsList = getDataFrom('/api/user/friends-list');
    const getMyInfo = getDataFrom('/api/my-info');
    const getContactInfos = getDataFrom('/api/contacts');
    Promise.all([getFriendsList, getMyInfo, getContactInfos])
      .then(values => {
        const friends = values[0].reduce((obj, friend) => {
          obj[friend._id] = friend;
          obj[friend._id].sharedWithFriend = [];
          obj[friend._id].sharedWithUser = [];
          return obj;
        }, {});
        values[1].map(info => {
          info.sharedWith.forEach(user => {
            friends[user].sharedWithFriend.push(info);
          });
        });
        values[2].infos.map(info => {
          friends[info.owner].sharedWithUser.push(info);
        });
        this.setState({ friends, allInfos: values[1],  });
      });
  }
  render() {
    const { message, tabs } = this.state;
    return (
      <Container>
        <MessageHeader message={message} />
            <Tab panes={tabs} />
      </Container>
    );
  }
}

// class AddressBook extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       message: null,
//       messageTimeoutID: null,
//       infos: [],
//       users: {},
//     };
    
//     this.setMessage = setMessage.bind(this);
//     this.loadDataToState = this.loadDataToState.bind(this);
//   }
//   componentDidMount() {
//     this.loadDataToState();
//   }
//   loadDataToState() {
//     getDataFrom('/api/contacts')
//       .then(response => {
//         this.setState({ users: response.users, infos: response.infos });
//       });
//   }
//   render() {
//     const { message, infos, users } = this.state;
//     return (
//       <Container>
//         <MessageHeader message={message} />
//         <Card.Group>
//           {infos.map((info, i) => 
//             <SharedInfoCard
//               key={`sharedinfo-${i}`}
//               i={i}
//               info={info}
//               owner={users[info.owner]}
//             />
//           )}
//         </Card.Group>
//       </Container>
//     );
//   }
// }

AddressBook.propTypes = {
  
};

export default AddressBook;