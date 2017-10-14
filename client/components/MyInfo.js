import React, { Component } from 'react';
import { Header, Container, Card } from 'semantic-ui-react';
import propTypes from 'prop-types';

import getMyInfos from '../actions/getMyInfos';
import MyInfoNew from './MyInfoNew';
import MyInfoCard from './MyInfoCard';
import MessageHeader from './MessageHeader';

import { setMessage } from '../utils/messages';

class MyInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myInfos: [],
      message: null,
      messageTimeoutID: null,
    };
    this.updateInfo = this.updateInfo.bind(this);
    // this.setMessage = this.setMessage.bind(this);
    this.setMessage = setMessage.bind(this);
  }
  componentDidMount() {
    this.updateInfo();
  }
  updateInfo() {
    getMyInfos().then(msg => this.setState({ myInfos: msg }));
  }
  render() {
    const { myInfos, message } = this.state;
    const { user } = this.props;
    return (
      <Container id="my-info">
        <MessageHeader message={message} />
        <Header as="h1">My Contact Information</Header>
        <MyInfoNew
          user={user}
          updateInfo={this.updateInfo}
          setMessage={this.setMessage}
        />
        <Container>
          <Card.Group itemsPerRow={3}>
            {myInfos.map((info, i) => (
              <MyInfoCard
                info={info}
                key={`infocard-${i}`}
                updateInfo={this.updateInfo} 
                setMessage={this.setMessage}
                updateInfo={this.updateInfo}
                user={user}
              />
            ))}
          </Card.Group>
        </Container>
      </Container>
    );
  }
}

MyInfo.propTypes = {
  user: propTypes.object,
};

export default MyInfo;