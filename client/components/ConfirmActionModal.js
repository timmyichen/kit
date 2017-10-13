import React, { Component } from 'react';
import { Button, Modal } from 'semantic-ui-react';
import propTypes from 'prop-types';

class ConfirmActionModal extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }
  handleOpen() {
    this.setState({ open: true });
  }
  handleClose() {
    this.setState({ open: false });
  }
  render() {
    const { triggerProps, triggerIcon, triggerText, action, reversible, onConfirm } = this.props;
    const { open } = this.state;
    return (
      <Modal 
        trigger={<Button onClick={this.handleOpen} icon={triggerIcon} content={triggerText} {...triggerProps} />}
        open={open}
        size="small"
      >
        <Modal.Header>Confirm: {action}?</Modal.Header>
        <Modal.Content>
          Are you sure you want to {action}? {reversible ? '' : 'This action cannot be undone.'}
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" onClick={this.handleClose} />
          <Button content="Confirm" onClick={(e) => {this.handleClose(); onConfirm(e)}} />
        </Modal.Actions>
      </Modal>
    );
  }
}

ConfirmActionModal.propTypes = {
  triggerProps: propTypes.object,
  triggerIcon: propTypes.string,
  triggerText: propTypes.string,
  action: propTypes.string.isRequired,
  reversible: propTypes.bool.isRequired,
  onConfirm: propTypes.func.isRequired
};

export default ConfirmActionModal;