import React, { Component } from 'react';
import { Modal, Table, Checkbox, Button } from 'semantic-ui-react';
import propTypes from 'prop-types';
import axios from 'axios';

import translateAPIerrors from '../utils/translateAPIerrors';
const postHeaders = require('../utils/misc').getCsrfPostHeader();

class FriendSharingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      isShared: [],
    };
    
    this.onOpen = this.onOpen.bind(this);
    this.onClose = this.onClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.saveData = this.saveData.bind(this);
    this.renderContactInfoRow = this.renderContactInfoRow.bind(this);
  }
  onOpen() {
    const { allInfos, friend } = this.props;
    const isShared = allInfos
      .filter(info => info.sharedWith.includes(friend._id))
      .map(info => info._id);
    this.setState({ open: true, isShared });
  }
  onClose() {
    this.props.refreshData();
    this.setState({ open: false });
  }
  handleChange(checked, info) {
    let { isShared } = this.state;
    if (checked) {
      isShared.push(info._id);
    } else {
      isShared = isShared.filter(id => id !== info._id);
    }
    this.setState({ isShared });
  }
  saveData() {
    const toShare = this.state.isShared;
    const { setMessage, friend } = this.props;
    const targetID = friend._id;
    axios.post('/api/share/by-user', { toShare, targetID }, postHeaders)
      .then(response => {
        if (response.status === 200) {
          setMessage({
            content: `Success: saved sharing permissions for ${friend.firstName}`,
            positive: true,
            duration: 4000,
          });
          this.onClose();
        }
      }).catch(err => {
        console.log(err)
        setMessage({
          content: `Error: ${translateAPIerrors(err.response.data.reason)}`,
          negative: true,
          duration: 4500
        });
      });
  }
  renderContactInfoRow(info, i) {
    const { label, type, primary, _id } = info;
    const { isShared } = this.state;
    return (
      <Table.Row key={`cir-${i}`}>
        <Table.Cell>{label}</Table.Cell>
        <Table.Cell>{primary ? 'primary ' : '' }{type}</Table.Cell>
        <Table.Cell>
          <Checkbox
            checked={isShared.includes(_id)}
            toggle
            onChange={(e, d) => this.handleChange(d.checked, info)}
          />
        </Table.Cell>
      </Table.Row>
    );
  }
  render() {
    const { friend, allInfos } = this.props;
    const { open } = this.state;
    const { firstName } = friend;
    return (
      <Modal
        trigger={<div><a>Manage Sharing Settings</a></div>}
        open={open}
        size="small"
        closeOnDimmerClick={false}
        closeIcon={true}
        onClose={this.onClose}
        onOpen={this.onOpen}
      >
        <Modal.Header>Manage Sharing Settings with {firstName}</Modal.Header>
        <Modal.Content>
          <Table basic="very" celled collapsing>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Contact Information Label</Table.HeaderCell>
                <Table.HeaderCell>Setting</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {allInfos.map(this.renderContactInfoRow)}
            </Table.Body>
          </Table>
        </Modal.Content>
        <Modal.Actions>
          <Button negative content="Cancel" onClick={this.onClose} />
          <Button positive content="Save" onClick={this.saveData} />
        </Modal.Actions>
      </Modal>
    );
  }
}

FriendSharingModal.propTypes = {
  friend: propTypes.object.isRequired,
  allInfos: propTypes.array.isRequired,
  setMessage: propTypes.func.isRequired,
  refreshData: propTypes.func.isRequired,
};

export default FriendSharingModal;