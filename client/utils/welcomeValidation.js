const axios = require('axios');

const YEARS_120 = 3732480000

const { isValidEmail, isValidName, isValidUsername, checkUsername } = require('./formValidation');

/*
checks to see that all fields are filled
*/
function validateWelcomeForm(values) {
  return new Promise((resolve, reject) => {
    const genders = ['male', 'female', 'other'];
    
    const errors =  {
      firstName: values.firstName !== '' ? null : 'Your first name is required',
      lastName: values.lastName !== '' ? null : 'Your last name is required',
      username: values.username !== '' ? null : 'You much choose a username',
      birthday: values.birthday !== '' ? null : 'You must enter a valid birthday',
      email: isValidEmail(values.email) ? null : 'Email validation failed',
      gender: genders.includes(values.gender) ? null : 'You must select your gender',
      agree: values.agree ? null : 'You must agree to the terms and conditions',
    }
    
    const { firstName, lastName, username } = values;
    
    if (!isValidName(firstName)) {
      errors.firstName = 'Your name must be letters, spaces, and dashes only.  20 characters or less.';
    }
    if (!isValidName(lastName)) {
      errors.lastName = 'Your name must be letters, spaces, and dashes only.  20 characters or less.';
    }
    if (!isValidUsername(username)) {
      errors.username = 'You must choose a valid username (6 to 16 characters long, lowercase letters and digits only)';
    }
    
    if (!errors.birthday) {
      const birthday = convertBirthday(values.birthday);
      if (birthday > Date.now()/1000) {
        errors.birthday = 'Your birthday must not be in the future';
      } else if (birthday < Date.now()/1000 - YEARS_120) {
        errors.birthday = 'I don\'t believe you.';
      }
    }
    
    if (!errors.username) {
      checkUsername(username).then(response => {
        errors.username = response;
        resolve(errors);
      });
    } else {
      resolve(errors);
    }
  });
}

function convertBirthday(birthday) {
  const dates = birthday.split('-');
  return new Date(dates[0], dates[1]-1, dates[2]).getTime() / 1000;
}

module.exports = {
  validateWelcomeForm,
}