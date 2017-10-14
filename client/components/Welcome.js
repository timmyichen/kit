import React, { Component } from 'react'
import { Form, Message } from 'semantic-ui-react';
import propTypes from 'prop-types';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

import getUser from '../actions/getUser';
import { checkUsername } from '../utils/formValidation';
import { validateWelcomeForm } from '../utils/welcomeValidation';

const inputFields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'username', label: 'Username' },
];

const genders = [
  { key: 'x', text: 'Click to Select', value: null },
  { key: 'm', text: 'Male', value: 'male' },
  { key: 'f', text: 'Female', value: 'female' },
  { key: 'o', text: 'Other', value: 'other' }
];

class Welcome extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      processing: false,
      proceed: false,
      success: false,
      form: {
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        birthday: '',
        gender: '',
        agree: false,
      },
      error: {}
    };
    
    this.onChangeInput = this.onChangeInput.bind(this);
    this.renderInputField = this.renderInputField.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.onUsernameBlur = this.onUsernameBlur.bind(this);
    this.validateAllFields = this.validateAllFields.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }
  
  componentDidMount() {
    getUser()
      .then(data => {
        this.setState({
          form: {
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            username: data.username || '',
            email: data.email || '',
            birthday: data.birthday || '',
            gender: data.gender || '',
            agree: false,
          }
        });
      });
  }
  
  onChangeInput(e, field) {
    const { form } = this.state;
    form[field] = e.target.value;
    this.setState({ form });
  }
  
  renderInputField(field) {
    const { form, error } = this.state;
    const { name, label } = field;
    return (
      <Form.Field required key={`input-${name}`}>
        <label>{label}</label>
        <input 
          placeholder={label}
          value={form[name]}
          onChange={e => this.onChangeInput(e, name)}
          onBlur={name === 'username' ? this.onUsernameBlur : ''}
        />
        {error[name] ? <Message color="red" content={error[name]} /> : ''}
      </Form.Field>
    );
  }
  
  toggleCheckbox(e, field) {
    const { form } = this.state;
    form[field] = e.target.checked;
    this.setState({ form });
  }
  
  onUsernameBlur() {
    const { error } = this.state;
    checkUsername(this.state.form.username).then(response => {
      error.username = response;
      this.setState({ error });
    });
  }
  
  validateAllFields() {
    this.setState({ processing: true }, () => {
      validateWelcomeForm(this.state.form).then(response => {
        this.setState({ error: response }, () => {
          for (let field in this.state.error) {
            if (this.state.error[field]) {
              this.setState({ processing: false });
              return;
            };
          }
          this.submitForm();
        })
      })
    });
  }
  
  submitForm() {
    axios.post('/api/registration/new', this.state.form)
      .then(res => {
        if (res.status === 200) {
          this.setState({ success: true }, () => {
            setTimeout(() => { this.setState({ proceed: true })}, 2500);
          });
        }
      });
  }
  
  render() {
    const { form, error, proceed, success, processing } = this.state;
    if(proceed) {
      return <Redirect to="/" />;
    }
    return (
      <div id="welcome">
        <h1>Complete your registration</h1>
        <Form>
          {inputFields.map(this.renderInputField)}
          
          <Form.Field required>
            <label>Email</label>
            <input placeholder="email" value={form.email} disabled />
          </Form.Field>
          {error['email'] ? <Message color="red" content={error['email']} /> : ''}
          
          <Form.Field required>
            <label>Birthday</label>
            <input
              type="date"
              value={form.birthday}
              onChange={(e) => this.onChangeInput(e, 'birthday')}
            />
          </Form.Field>
          {error['birthday'] ? <Message color="red" content={error['birthday']} /> : ''}
          
          <select className="ui select" onChange={e => this.onChangeInput(e, 'gender')}>
            {genders.map(gender => (
              <option key={gender.key} value={gender.value}>{gender.text}</option>)
            )}
          </select>
          {error['gender'] ? <Message color="red" content={error['gender']} /> : ''}
          
          <label>
            <input
              className="ui checkbox"
              type="checkbox"
              checked={form.agree}
              name="agree"
              onChange={e => this.toggleCheckbox(e, 'agree')}
            />
            I agree to the terms and conditions <span className="required-star">*</span>
          </label>
          {error['agree'] ? <Message color="red" content={error['agree']} /> : ''}
          
          <Form.Button 
            primary
            disabled={!form.agree || processing}
            onClick={this.validateAllFields}
          >
            Complete Registration
          </Form.Button>
        </Form>
        { success ? <Message success
          header="Success!"
          content="Your information has been saved! Redirecting.." /> : '' }
      </div>
    );
  }
}

export default Welcome;