import React, { Component } from 'react';
import { Container, Card } from 'semantic-ui-react';
import propTypes from 'prop-types';

import MessageHeader from './MessageHeader';
import SharedInfoCard from './SharedInfoCard';

import { setMessage } from '../utils/messages';
import { getDataFrom } from '../actions/getDataFrom';

class AddressBook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      messageTimeoutID: null,
      infos: [],
      users: {},
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
    const { message, infos, users } = this.state;
    return (
      <Container>
        <MessageHeader message={message} />
        <Card.Group>
          {infos.map((info, i) => 
            <SharedInfoCard
              key={`sharedinfo-${i}`}
              i={i}
              info={info}
              owner={users[info.owner]}
            />
          )}
        </Card.Group>
      </Container>
    );
  }
}

AddressBook.propTypes = {
  
};

export default AddressBook;