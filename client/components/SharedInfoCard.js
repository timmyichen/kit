import React, { Component } from 'react';
import { Card } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';
import moment from 'moment';

class SharedInfoCard extends Component {
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
          {countryCode ? <span>Country Code: {countryCode}<br/></span> : ''}
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
  render() {
    const { i, info, owner } = this.props;
    const { firstName, lastName, username } = owner;
    const { type, data, primary, label, lastUpdated, notes } = info;
    return (
      <Card fluid color={i % 2 === 0 ? 'blue' : 'teal'}>
        <Card.Content>
          <Card.Header>
            <Link to={`/profile/${username}`}>{firstName} {lastName}</Link>'s {primary ? 'primary ' : ''} {type}
          </Card.Header>
          <Card.Meta>{label}</Card.Meta>
          <Card.Description>{this.createCardDescription(type, data)}</Card.Description>
        </Card.Content>
        {notes ? <Card.Content extra>{notes}</Card.Content> : '' }
        <Card.Content extra>Last updated {moment(lastUpdated).format("YYYY-MM-DD")}</Card.Content>
      </Card>
    );
  }
}

SharedInfoCard.propTypes = {
  i: propTypes.number.isRequired,
  info: propTypes.object.isRequired,
  owner: propTypes.object.isRequired,
};

export default SharedInfoCard;