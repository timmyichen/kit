import React, { Component } from 'react';
import { Form, Popup, Icon, Message } from 'semantic-ui-react';
import propTypes from 'prop-types';

const fields = [
  { label: 'Email Address', name: 'address', required: true },
];

class EmailForm extends Component {
  constructor(props) {
    super(props);
    
    this.renderField = this.renderField.bind(this);
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
        <input
          type="text"
          placeholder={label}
          value={data[name]}
          onChange={(e) => onChangeData(e, name)}
        />
        {error && error[name] ? <Message color="red" content={error[name]} /> : ''}
      </Form.Field>
    );
  }
  render() {
    //returning the div with class is necessary to avoid nesting a form in a form while keeping styles
    return (
      <div className="ui form">
        {fields.map(this.renderField)}
      </div>
    );
  }
}

EmailForm.propTypes = {
  data: propTypes.object.isRequired,
  onChangeData: propTypes.func.isRequired,
  error: propTypes.object,
};

export default EmailForm;