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
      tabs: [
        { menuItem: 'My Friends', render: () => (
          <Tab.Pane>
            <FriendsPage
              setMessage={this.setMessage}
              user={props.user}
              refreshUser={props.refreshUser}
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
      ]
    };
    
    this.setMessage = setMessage.bind(this);
    this.loadDataToState = this.loadDataToState.bind(this);
  }
  componentDidMount() {
    this.loadDataToState();
  }
  loadDataToState() {
    getDataFrom('/api/contacts')
      .then(response => {
        this.setState({ users: response.users, infos: response.infos });
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