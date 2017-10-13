import React, { Component } from 'react';
import { Form, Popup, Icon, Message } from 'semantic-ui-react';
import propTypes from 'prop-types';
import { countries } from '../../resources/country-list';

const fields = [
  { label: 'Addressee\'s Name', name: 'addresseeName', required: true, helpText: 'The name the letter/package should be addressed to' },
  { label: 'Street Address', name: 'streetAddress', required: true, helpText: 'Street address or P.O. box number' },
  { label: 'Unit Number', name: 'unitNumber', required: false, helpText: '' },
  { label: 'City, State, Postal Code, or Province/County', name: 'citySubdivision', required: true, helpText: 'This varies by country to country, but generally it\'s whatever you write on the last line before the country' },
];

class AddressForm extends Component {
  constructor(props) {
    super(props);
    
    this.renderField = this.renderField.bind(this);
    this.renderCountrySelect = this.renderCountrySelect.bind(this);
  }
  componentDidMount() {
    //manually make the name the user's first/last name
    const { firstName, lastName } = this.props.user;
    this.props.onChangeData({ target: { value: firstName + ' ' + lastName } }, 'addresseeName');
  }
  renderCountrySelect() {
    const { onChangeData, error } = this.props;
    return (
      <div className="required field">
        <label>Country</label>
        <select className="ui select" onChange={(e) => onChangeData(e, 'country')}>
          {countries.map(c => (
            <option key={c.countryCode} value={c.name}>
              {c.name} {c.alias ? `(${c.alias})` : ''}
            </option>
          ))}
        </select>
        {error && error['country'] ? <Message color="red" content={error['country']} /> : ''}
      </div>
    );
  }
  renderField(field) {
    const { label, name, required, helpText } = field;
    const { data, onChangeData, error } = this.props;
    return (
      <Form.Field key={name} className={`${required ? 'required' : ''} field`}>
        <label>
          {label}
          { helpText ? <Popup trigger={<Icon name="question circle outline" />} content={helpText} /> : ''}
        </label>
        <input type="text" placeholder={label} value={data[name]} onChange={(e) => onChangeData(e, name)} />
        {error && error[name] ? <Message color="red" content={error[name]} /> : ''}
      </Form.Field>
    );
  }
  render() {
    //returning the div with class is necessary to avoid nesting a form in a form while keeping styles
    return (
      <div className="ui form">
        {fields.map(this.renderField)}
        {this.renderCountrySelect()}
      </div>
    );
  }
}

AddressForm.propTypes = {
  data: propTypes.object.isRequired,
  onChangeData: propTypes.func.isRequired,
  error: propTypes.object,
  user: propTypes.object,
};

export default AddressForm;