const ObjectID = require('mongodb').ObjectID;

const validations = require('../client/utils/formValidation');

const YEARS_120 = 3732480000;

function validateUsername(db, username) {
  return new Promise((resolve, reject) => {
    db.collection('users')
      .find({ username })
      .toArray((err, docs) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(docs.length === 0);
      })
  });
}

function requiresWelcome(db, id) {
  return new Promise((resolve, reject) => {
    db.collection('users')
      .find({ _id: ObjectID(id) })
      .toArray((err, docs) => {
        if (err) {
          reject(err);
          return;
        }
        const { firstName, lastName, username, email, birthday, gender } = docs[0]
        resolve(
            !firstName ||
            !lastName ||
            !username ||
            !email ||
            !birthday ||
            !gender
        )
      })
  });
}

function validateRegistration(values, db) {
  return new Promise((resolve, reject) => {
    try {
      const genders = ['male', 'female', 'other'];
      const { firstName, lastName, username, birthday, gender } = values;
      
      const errors = {
        firstName: firstName === '' || !validations.isValidName(firstName),
        lastName: lastName === '' || !validations.isValidName(lastName),
        username: username === '' || !validations.isValidUsername(username),
        birthday: birthday === '',
        gender: genders.indexOf(gender) === -1,
      }
      
      if (!errors.birthday) {
        const dates = birthday.split('-');
        const bdayUnixTimestamp = new Date(dates[0], dates[1]-1, dates[2]).getTime() / 1000;
        const now = Date.now()/1000;
        errors.birthday = bdayUnixTimestamp > now || bdayUnixTimestamp < now - YEARS_120;
      }
      
      if (!errors.username) {
        validateUsername(db, username).then(isValid => {
          errors.username = !isValid;
          resolve(errors);
        })
      } else {
        resolve(errors)
      }
    } catch(e) {
      reject(e);
    }
  });
}

module.exports = {
  validateUsername,
  requiresWelcome,
  validateRegistration,
}