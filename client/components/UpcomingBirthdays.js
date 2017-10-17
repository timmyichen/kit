import React, { Component } from 'react';
import { Header, Container, Card } from 'semantic-ui-react';
import propTypes from 'prop-types';

import { getDataFrom } from '../actions/getDataFrom';

class UpcomingBirthdays extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    return (
      <Container>
        <Header as="h2">Upcoming Birthdays</Header>
        TODO
      </Container>
    );
  }
}

UpcomingBirthdays.propTypes = {
  user: propTypes.object
};

export default UpcomingBirthdays;