import React, { Component } from 'react';
import { Modal, Button, Form, Divider, Message } from 'semantic-ui-react';
import propTypes from 'prop-types';
import axios from 'axios';

import AddressForm from './newContactInfo/AddressForm';
import PhoneForm from './newContactInfo/PhoneForm';
import EmailForm from './newContactInfo/EmailForm';
import AlertMessage from './AlertMessage';

import { validateContactInfoForm, containsErrors } from '../utils/contactInfoValidation';
import { parsePhoneNumber } from '../utils/formValidation';

const defaultData = {
  empty: {},
  address: {
    addresseeName: '',
    streetAddress: '',
    unitNumber: '',
    citySubdivision: '',
    country: '',
    },
  phone: {
    countryCode: '',
    number: '',
  },
  email: {
    address: '',
  }
};

class MyInfoNew extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      open: false,
      processing: false,
      form: {
        type: null,
        data: {},
        label: '',
        primary: false,
        notes: '',
      },
      error: {},
      types: [
        { label: 'Click to Select', value: 'empty' },
        { label: 'Address', value: 'address' },
        { label: 'Phone Number', value: 'phone' },
        { label: 'Email', value: 'email'}
      ],
    };
    
    this.handleOpen = this.handleOpen.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onChangeForm = this.onChangeForm.bind(this);
    this.onChangeData = this.onChangeData.bind(this);
    this.onPhoneBlur = this.onPhoneBlur.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.renderAddButton = this.renderAddButton.bind(this);
    this.renderEditButton = this.renderEditButton.bind(this);
    this.renderFormType = this.renderFormType.bind(this);
    this.validateContactData = this.validateContactData.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }
  handleOpen() {
    let { types } = this.state;
    if (this.props.edit) {
      const { label, type, primary, notes, data } = this.props.info;
      const form = { label, type, primary, notes, data };
      types = types.filter((infotype) => infotype.value === type);
      this.setState({ types, form, open: true });
    }  else {
      this.setState({ open: true });
    }
  }
  onClose() {
    this.setState({
      open: false,
      processing: false,
      form: {
        type: null,
        data: {},
        label: '',
        primary: false,
        notes: '',
      },
      error: {}
    });
  }
  onChangeForm(e, field) {
    const { form, error } = this.state;
    form[field] = e.target.value;
    if (field === 'type') {
      //using parse/stringify to prevent nested objects from retaining values
      form.data = JSON.parse(JSON.stringify(defaultData[e.target.value]));
      form.label = '';
      form.notes = '';
      form.primary = false;
      error.data = null;
      error.label = '';
      error.notes = '';
    }
    this.setState({ form, error });
  }
  onChangeData(e, field) {
    const { form } = this.state;
    form.data[field] = e.target.value;
    this.setState({ form });
  }
  onPhoneBlur(field) {
    const { form } = this.state;
    form.data[field] = parsePhoneNumber(form.data[field]);
    this.setState({ form });
  }
  renderAddButton() {
    return (
      <Button primary
        content="Add New"
        icon="add square"
        labelPosition="right"
        onClick={this.handleOpen}
      />
    );
  }
  renderEditButton() {
    return (
      <Button
        icon="edit"
        onClick={this.handleOpen}
      />
    );
  }
  renderFormType() {
    const { type, data } = this.state.form;
    const { error } = this.state;
    const { user } = this.props;
    const formComponents = {
      address: <AddressForm user={user} onChangeData={this.onChangeData} data={data} error={error.data} />,
      phone: <PhoneForm onChangeData={this.onChangeData} data={data} onPhoneBlur={this.onPhoneBlur} error={error.data} />,
      email: <EmailForm onChangeData={this.onChangeData} data={data} error={error.data} />,
    };
    return formComponents[type];
  }
  toggleCheckbox(e, field) {
    const { form } = this.state;
    form[field] = e.target.checked;
    this.setState({ form });
  }
  validateContactData() {
    this.setState({ processing: true }, () => {
      const error = validateContactInfoForm(this.state.form);
      this.setState({ error }, () => {
        if (!containsErrors(error)) {
          this.submitForm();
        } else {
          this.setState({ processing: false });
        }
      });
    });
  }
  submitForm() {
    const { form } = this.state;
    const { edit, infoID, setMessage, updateInfo } = this.props;
    if (edit) form._id = infoID;
    axios.post('/api/my-info/upsert', form)
      .then(res => {
        if (res.status === 200) {
          setMessage({
            content: `Success: ${edit ? 'edited' : 'added'} contact info '${form.label}'`,
            positive: true,
            duration: 4500
          })
          updateInfo();
          this.onClose();
        }
      });
  }
  render() {
    const { type, label, notes, primary } = this.state.form;
    const { error, processing, open, types } = this.state;
    const { edit } = this.props;
    return (
      <Modal
        trigger={edit ? this.renderEditButton() : this.renderAddButton()}
        onClose={this.onClose}
        open={open}
        closeOnDimmerClick={false}
        closeIcon={true}
      >
        <Modal.Header>{edit ? 'Edit' : 'Add New'} Contact Information</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field required>
              <label>Type of Contact Information:</label>
              <select className="ui select" onChange={(e) => this.onChangeForm(e, 'type')} disabled={edit}>
                {types.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}
              </select>
              {error['type'] ? <Message color="red" content={error['type']} /> : ''}
            </Form.Field>
            <Divider />
            {type === null ? '' : 
              <Form.Field required>
                <label>Label</label>
                <input
                  type="text"
                  placeholder={`A short name describing your ${type.toLowerCase()}`}
                  value={label}
                  onChange={(e) => this.onChangeForm(e, 'label')}
                />
                {error['label'] ? <Message color="red" content={error['label']} /> : ''}
              </Form.Field>
            }
            
            {this.renderFormType()}
            
            {type === null ? '' : 
              <div>
                <Form.Field>
                  <label>Notes</label>
                  <textarea
                    type="text"
                    placeholder={`Any additional need-to-knows about your ${type.toLowerCase()}`}
                    value={notes}
                    onChange={(e) => this.onChangeForm(e, 'notes')}
                  />
                  {error['notes'] ? <Message color="red" content={error['notes']} /> : ''}
                </Form.Field>
                <Form.Field>
                  <label>
                    <input
                      className="ui checkbox"
                      type="checkbox"
                      checked={primary}
                      name="primary"
                      onChange={e => this.toggleCheckbox(e, 'primary')}
                    />
                    This is my primary {type.toLowerCase()}
                  </label>
                </Form.Field>
              </div>
            }
            
            <Divider />
            <Form.Button
              disabled={processing}
              primary
              onClick={this.validateContactData}
            >
              {edit ? 'Update' : 'Create'} Contact Card
            </Form.Button>
          </Form>
        </Modal.Content>
      </Modal>
    );
  }
}

MyInfoNew.propTypes = {
  edit: propTypes.bool,
  infoID: propTypes.string,
  user: propTypes.object,
  setMessage: propTypes.func.isRequired,
  updateInfo: propTypes.func.isRequired,
  info: propTypes.object,
};

export default MyInfoNew;