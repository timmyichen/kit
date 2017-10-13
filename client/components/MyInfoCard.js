import React, { Component } from 'react';
import { Card } from 'semantic-ui-react';
import propTypes from 'prop-types';
import axios from 'axios';
import moment from 'moment';

import ConfirmActionModal from './ConfirmActionModal';
import AlertMessage from './AlertMessage';
import MyInfoNew from './MyInfoNew';

class MyInfoCard extends Component {
  constructor(props) {
    super(props);
    
    this.createCardDescription = this.createCardDescription.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }
  createCardDescription(type, data) {
    if (type === 'address') {
      const { addresseeName, streetAddress, unitNumber, citySubdivision, country } = data;
      return (
        <div>
          {addresseeName}<br/>
          {streetAddress} {unitNumber}<br/>
          {citySubdivision}<br/>
          {country}<br/>
        </div>
      );
    } else if (type === 'phone') {
      const { countryCode, number } = data;
      return (
        <div>
          {countryCode ? `Country Code: ${countryCode}` : ''}<br/>
          Number: {number}
        </div>
      );
    } else if (type === 'email') {
      const { address } = data;
      return (
        <div>
          Email Address: {address}
        </div>
      );
    }
  }
  handleEdit() {
    
  }
  handleDelete() {
    const { info, updateInfo, setMessage } = this.props;
    axios.post('/api/my-info/delete', { id: info._id, type: info.type, label: info.label})
      .then(response => {
        if (response.data.success) {
          setMessage({
            content: `Success: deleted '${info.label}'`,
            positive: true,
            duration: 4500
          })
          updateInfo();
        }
      });
  }
  render() {
    const { label, type, primary, lastUpdated, data, notes, _id } = this.props.info;
    const { updateInfo, user, info, setMessage } = this.props;
    const date = moment(lastUpdated).format("YYYY-MM-DD");
    return (
      <Card>
        <Card.Content>
          <div className="card-controls">
            <MyInfoNew
              user={user}
              updateInfo={updateInfo}
              edit={true}
              info={info}
              infoID={_id}
              setMessage={setMessage}
            />
            <ConfirmActionModal
              triggerIcon="trash"
              action={`delete your ${type} called '${label}'`}
              reversible={false}
              onConfirm={this.handleDelete}
            />
          </div>
          <Card.Header>{label}</Card.Header>
          <Card.Meta>{primary ? `Primary ${type}` : type }</Card.Meta>
          <Card.Description>
            {this.createCardDescription(type, data)}
          </Card.Description>
        </Card.Content>
        { notes ? <Card.Content extra>{notes}</Card.Content> : '' }
        <Card.Content extra>
          <span>Last updated on {date}</span>
        </Card.Content>
      </Card>
    );
  }
}

MyInfoCard.propTypes = {
  user: propTypes.object,
  info: propTypes.object,
  updateInfo: propTypes.func.isRequired,
  setMessage: propTypes.func.isRequired,
};

export default MyInfoCard;