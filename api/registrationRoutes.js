/*
/api/check-username
GET
Returns true or false if the username has been taken or not
*/

const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;

const requireLogin = require('../middlewares/requireLogin');
const finishedSetup = require('../middlewares/finishedSetup');
const utils = require('../server-utils/validation');

router.get('/check-username/', requireLogin, (req, res) => {
  const db = req.app.locals.db;
  const username = req.query.username;
  
  utils.validateUsername(db, username)
    .then(response => {
      res.send({ valid: response });
    })
    .catch(err => {
      console.log(err);
      res.send({ error: true, message: err })
    })
});

router.post('/new', requireLogin, finishedSetup, (req, res) => {
  const db = req.app.locals.db;
  utils.validateRegistration(req.body, db).then(errors => {
    for(let field in errors) {
      if (errors[field]) {
        console.log(`${req.user.email} tried to submit bad information: ${field}:${errors[field]}`)
        res.status(403);
        return res.send(`There was an error in submitting your form, either due to an actual
         error or because you might be trying to be naughty.  Go back and try again.`);
      }
    }
    const data = req.body;
    db.collection('users').findOneAndUpdate(
      { _id: ObjectID(req.user._id) },
      { $set: {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        birthday: data.birthday,
        gender: data.gender,
      }}
    )
    .then(docs => {
      console.log(`${req.user.email} completed registration without issue`)
      res.status(200);
      res.send('/')
    })
    .catch(err => {
      console.log(`ERROR in completing registration for ${req.user.email}:  ${err}`);
      res.status(403);
      return res.send(`There was an error in submitting your form, either due to an actual
       error or because you might be trying to be naughty.  Go back and try again.`);
    })
  })
});

module.exports = router;

