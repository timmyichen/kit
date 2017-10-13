const axios = require('axios');

function checkUsername(username) {
  return new Promise((resolve, reject) => {
    axios.get('/api/registration/check-username', { params: { username }})
      .then(res => {
        if (res.data.valid) {
          resolve(null);
        } else {
          resolve('That username is already taken. Please choose another.')
        }
      })
      .catch(err => { reject(err) });
  })
}

// TODO - currently not invalidating consecutive dashes in name
function isValidName(name) {
  const re = /^[-a-zA-Z]+(?!.*\s{2,})[-\sa-zA-Z]*[a-zA-Z]$/;
  return re.test(name) === true && name.length <= 20;
}

function isValidEmail(email) {
  const re = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  // const re = /[A-Z0-9._%+-]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/;
  return re.test(email) === true;
}

//6-16 chars, alphanumeric, lowercase only
function isValidUsername(username) {
  const re = /^(?!.*__.*)(?!.*\.\..*)[a-z0-9]{6,16}$/;
  return re.test(username) === true;
}

function isValidPhone(number) {
  const checked = number ? number : ''
  const parsed = parsePhoneNumber(checked);
  return parsed.length <= 20 && parsed.length >=3;
}

function parsePhoneNumber(number) {
  const re = /[^\d+x-]/g; //captures invalid characters (nondigits, not x, - or +)
  return number.replace(re, '');
}

module.exports = {
  checkUsername,
  isValidName,
  isValidEmail,
  isValidUsername,
  isValidPhone,
  parsePhoneNumber,
}