const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;

const requireLogin = require('../middlewares/requireLogin');
const { validateContactInfoForm, containsErrors } = require('../client/utils/contactInfoValidation');

/*  /api/contacts
    GET
    Array of all contact info shared with user */

/*  /api/my-info/
    GET
    Array of user’s contact info  */
router.get('/my-info/', requireLogin, (req, res) => {
  const ownedByUser = req.user.owns.map(id => ObjectID(id));
  const db = req.app.locals.db;
  db.collection('contactinfos').find({ _id: { $in: ownedByUser }}).toArray((err, docs) => {
    if (err) console.log(`error at /api/my-info/ for user ${req.user.email}: ${err}`);
    res.send(docs);
  })
});

/*  /api/my-info/upsert
    POST
    Object of user’s new contact info to be added OR updated
    updated objects will include an _id field to indicate old ID */
router.post('/my-info/upsert', requireLogin, (req, res) => {
  const obj = req.body;
  const errors = validateContactInfoForm(obj);
  if (containsErrors(errors)) {
    console.log(`${req.user.email} tried to create new contactinfo w/ bad information: ${errors}`);
    return res.status(403).send(`There was an error in submitting your fom, either due to an actual error
      or because you might be trying to be naughty.  Go back and try again.`);
  }
  const id = req.user._id + '';
  const db = req.app.locals.db;
  obj.owner = id;
  obj.lastUpdated = Date.now();
  obj.sharedWith = obj.sharedWith || [];
  if (obj.primary) {
    db.collection('contactinfos')
      .update(
        { owner: id, type: obj.type },
        { $set: { primary: false } },
        { multi: true }
      )
      .then(response => {
        upsertContactInfo(req, res, db, obj);
      })
  } else {
    upsertContactInfo(req, res, db, obj);
  }
});

//helper function for /my-info/upsert
function upsertContactInfo(req, res, db, obj) {
  let promise, action;
  const { data, primary, label, lastUpdated, notes } = obj;
  if (obj._id) {
    action = 'update';
    promise = db.collection('contactinfos').findOneAndUpdate(
      { _id: ObjectID(obj._id), owner: req.user._id + '' },
      { $set: { data, primary, label, lastUpdated, notes }}
    );
  } else {
    action = 'insert';
    promise = db.collection('contactinfos').insertOne(obj).then(response => {
      const insertedID = response.ops[0]._id + '';
      db.collection('users').update(
        { _id: ObjectID(req.user._id) },
        { $push: { owns: insertedID } }
      ).catch(err => {
        console.log(`REALLY BAD ERROR INVOLVING DATA THAT NEEDS FIXING`);
        console.log(`in adding new contactinfo ${insertedID} to 'owns' of ${req.user._id}: ${err}`);
      });
    });
  }
  promise.then(response => {
    console.log(`${req.user.email} ${action} new contact info of type ${obj.type}`);
    res.status(200).redirect('/my-info');
  })
  .catch(err => console.log(`error in ${action} new contact info: ${err}`));
}

/*
/api/my-info/delete
POST
ID of info to be deleted
*/

router.post('/my-info/delete', (req, res) => {
  const id = ObjectID(req.body.id);
  const db = req.app.locals.db;
  const owner = req.user._id + '';
  db.collection('contactinfos').remove({ _id: id , owner: owner })
    .then(response => {
      db.collection('users').findOneAndUpdate(
        { _id: ObjectID(owner) },
        { $pull: { owns: id + '' } }
      ).then(response => {
        console.log(`User ${req.user.email} deleted contact info of type ${req.body.type} called '${req.body.label}'`);
        return res.status(200).send({ success: true });
      }).catch(err => {
        console.log(`REALLY BAD ERROR INVOLVING DATA THAT NEEDS FIXING`);
        console.log(`in removing contactinfo ${id} from 'owns' of ${owner}: ${err}`);
        return res.status(400).send('unknown error in deletion');
      });
    })
    .catch(err => {
      console.log(`error in deleting contact info by ${req.user.email} on CI with ID ${req.body.id}: ${err}`);
      return res.status(400).send('unknown error in deletion');
    });
});

/*
/api/my-info/share
POST
ID of info to be shared, username of friend shared to

/api/my-info/unshare
POST
ID of info to be unshared, username of friend shared to

*/

module.exports = router;