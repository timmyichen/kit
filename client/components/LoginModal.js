import React, { Component } from 'react';
import { Modal, Button, Icon } from 'semantic-ui-react';
import propTypes from 'prop-types';

const authMethods = [
  { name: 'google plus', label: 'Google Plus', path: '/auth/google' },
  { name: 'facebook', label: 'Facebook', path: '/auth/facebook' },
  { name: 'linkedin', label: 'LinkedIn', path: '/auth/linkedin' },
];

class LoginModal extends Component {
  renderAuthButton(method, i) {
    const { name, label, path } = method;
    const action = this.props.login ? 'Log In' : 'Sign Up';
    return (
      <a href={path} key={`auth-${name}`}>
        <Button color={name}>
          <Icon name={name} />{action} with {label}
        </Button>
      </a>
    );
  }
  render() {
    const { trigger, header } = this.props;
    return (
      <Modal trigger={trigger}>
        <Modal.Header>{header}</Modal.Header>
        <Modal.Content>
          {authMethods.map(this.renderAuthButton.bind(this))}
        </Modal.Content>
        <Modal.Description>
          <p>Note: None of your social media accounts will have access to the data that you put on your KIT account.</p>
        </Modal.Description>
      </Modal>
    );
  }
}

LoginModal.propTypes = {
  trigger: propTypes.object.isRequired,
  header: propTypes.string.isRequired,
  login: propTypes.bool.isRequired,
};

export default LoginModal;