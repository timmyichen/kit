let { countries } = require('../resources/country-list');
countries = countries.map(c => c.name).slice(1);

const { isValidEmail, isValidPhone } = require('./formValidation');

function validateContactInfoForm(values) {
  const types = ['address', 'phone', 'email'];
  
  const errors = {
    type: types.includes(values.type) ? null : 'You must choose a valid type of contact information',
    label: values.label !== '' ? null : 'You must enter a label',
    notes: values.notes.length <= 400 ? null : 'Your notes cannot exceed 400 characters',
    data: {},
  };
  
  if (errors.type) {
    return errors;
  } else { //this block checks for excessively long values and empty values
    const fieldsNotRequired = ['unitNumber', 'countryCode'];
    const charLimits = { address: 100, phone: 20, email: 200 };
    const { type } = values;
    const { data } = values;
    for (let field in data) {
      if (data[field].trim() === '' && !fieldsNotRequired.includes(field)) {
        errors.data[field] = 'This field is required.';
      } else if (data[field].length > charLimits[type]) {
        errors.data[field] = `Size must not exceed ${charLimits[type]} characters`;
      }
    }
    
    if (type === 'address' && !countries.includes(data['country'])) {
      errors.data.country = 'You must select a country';
    } else if (type === 'email' && !isValidEmail(data.address)) {
      errors.data.address = 'You must enter a valid email address';
    } else if (type === 'phone' && !isValidPhone(data.number)) {
      errors.data.number = 'You must enter a valid phone number';
    }
    
    return errors;
  }
}

function containsErrors(error) {
  for (let field in error.data) {
    if (error.data[field]) return true;
  }
  if (error.type || error.label || error.notes) return true;
  return false;
}

module.exports = {
  validateContactInfoForm,
  containsErrors,
}