import React, { Component } from 'react';
import { Menu, Container, Icon } from 'semantic-ui-react';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';

import LoginModal from './LoginModal';

class Navbar extends Component {
  userLoggedIn() {
    return (
      <Menu.Menu position="right">
        <Menu.Item as={Link} to="/my-info">
          My Info
        </Menu.Item>
        <Menu.Item as={Link} to="/dashboard">
          Dashboard
        </Menu.Item>
        <Menu.Item as={Link} to="/contact-infos">
          Address Book
        </Menu.Item>
        <Menu.Item as="a">
          Account
        </Menu.Item>
      </Menu.Menu>
    );
  }
  noUser() {
    return (
      <Menu.Menu position="right">
        <LoginModal
          trigger={<Menu.Item as="a">Log In</Menu.Item>}
          header="Log in with an existing account"
          login={true}
        />
        <LoginModal
          trigger={<Menu.Item as="a">Sign Up</Menu.Item>}
          header="Sign up with one of the following"
          login={false}
        />
      </Menu.Menu>
    );
  }
  render() {
    return (
      <Menu id="navbar" size="large">
        <Container>
          <Link to="/">
            <Menu.Item>Keep In Touch</Menu.Item>
          </Link>
          {this.props.user ? this.userLoggedIn() : this.noUser()}
        </Container>
      </Menu>
    );
  }
}

Navbar.propTypes = {
  user: propTypes.object,
};

export default Navbar;