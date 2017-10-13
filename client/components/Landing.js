import React, { Component } from 'react';
import { Header, Container } from 'semantic-ui-react';
import propTypes from 'prop-types';

class Landing extends Component {
  render() {
    return (
      <Container>
        <Header as="h1">Welcome to KIT and stuff</Header>
      </Container>
    );
  }
}

export default Landing;