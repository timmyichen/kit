const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;
const array = require('lodash/array');

const requireLogin = require('../middlewares/requireLogin');
const { validateContactInfoForm, containsErrors } = require('../client/utils/contactInfoValidation');

/*  /api/contacts
    GET
    Array of all contact info shared with user */
router.get('/contacts', requireLogin, (req, res) => {
  const { db, logger } = req.app.locals;
  const hasAccessTo = req.user.hasAccessTo.map(id => ObjectID(id));
  db.collection('contactinfos').find(
    { _id: { $in: hasAccessTo }},
    { sharedWith: 0 }
  ).toArray((err, docs) => {
    if (err) {
      logger.error(`at getting contactinfos for /api/contacts for user  ${req.user._id}`, err);
      res.status(500).send({ reason: 'unknown' });
    }
    let userIDs = docs.reduce((arr, info) => {arr.push(info.owner + ''); return arr;}, []);
    userIDs = array.uniq(userIDs).map(id => ObjectID(id));
    db.collection('users').find(
      { _id: { $in: userIDs } },
      { firstName: 1, lastName: 1, username: 1 }
    ).toArray((err, users) => {
      if (err) {
        logger.error(`at getting users for /api/contacts for user  ${req.user._id}`, err);
        res.status(500).send({ reason: 'unknown' });
      }
      const usersObj = users.reduce((obj, user) => {obj[user._id + ''] = user; return obj;}, {});
      res.send({ infos: docs, users: usersObj });
    });
  });
});

/*  /api/my-info/
    GET
    Array of user’s contact info  */
router.get('/my-info/', requireLogin, (req, res) => {
  const { db, logger } = req.app.locals;
  const ownedByUser = req.user.owns.map(id => ObjectID(id));
  db.collection('contactinfos').find({ _id: { $in: ownedByUser }}).toArray((err, docs) => {
    if (err) {
      logger.error(`at /api/my-info/ for user ${req.user.email}`, err);
      res.status(500).send({ reason: 'unknown' });
    }
    res.send(docs);
  });
});

/*  /api/my-info/upsert
    POST
    Object of user’s new contact info to be added OR updated
    updated objects will include an _id field to indicate old ID */
router.post('/my-info/upsert', requireLogin, (req, res) => {
  const { db, logger } = req.app.locals;
  const obj = req.body;
  delete obj._csrf;
  const errors = validateContactInfoForm(obj);
  if (containsErrors(errors)) {
    logger.error(`${req.user.email} tried to create new contactinfo w/ bad information`, errors);
    return res.status(403).send(`There was an error in submitting your fom, either due to an actual error
      or because you might be trying to be naughty.  Go back and try again.`);
  }
  const id = req.user._id + '';
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
        upsertContactInfo(req, res, obj);
      });
  } else {
    upsertContactInfo(req, res, obj);
  }
});

//helper function for /my-info/upsert
function upsertContactInfo(req, res, obj) {
  const { db, logger } = req.app.locals;
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
        logger.error(`in adding new contactinfo ${insertedID} to 'owns' of ${req.user._id}`, err, {severe: 'data'});
      });
    });
  }
  promise.then(response => {
    logger.info(`${req.user.email} ${action} new contact info of type ${obj.type}`);
    res.status(200).redirect('/my-info');
  })
  .catch(err => logger.error(`in ${action} new contact info`, err));
}

/*  /api/my-info/delete
    POST
    ID of info to be deleted */
router.post('/my-info/delete', (req, res) => {
  const { db, logger } = req.app.locals;
  const id = ObjectID(req.body.id);
  const owner = req.user._id + '';
  const removeContactInfo = db.collection('contactinfos').remove({ _id: id , owner: owner });
  const removeFromUser = db.collection('users').findOneAndUpdate(
    { _id: ObjectID(owner) },
    { $pull: { owns: id + '' } }
  );
  Promise.all([removeContactInfo, removeFromUser])
    .then(values => {
      logger.info(`User ${owner} deleted contact info of type ${req.body.type} called '${req.body.label}' with id ${id}`);
      return res.send({ success: true });
    })
    .catch(err => {
      logger.error(`in removing contactinfo ${id} from ${owner}`, err, {severe: 'data'});
      return res.status(400).send({ reason: 'unknown' });
    });
});



/*  /api/my-info/ping
    POST
    ID of info to be pinged */

module.exports = router;