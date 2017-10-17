const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;
const array = require('lodash/array');

const requireLogin = require('../middlewares/requireLogin');

/*  /share/by-contact
    POST
    id of contact information, ids of people to share with */
router.post('/by-contact', requireLogin, (req, res) => {
  const { db, logger } = req.app.locals;
  const { friends, _id, owns } = req.user;
  let { sharedWith, contactID } = req.body;
  if (!owns.includes(contactID)) {
    return res.status(403).send({ reason: 'not-owner' });
  }
  const diff = sharedWith.filter(id => !friends.includes(id));
  if (diff.length > 0) {
    return res.status(403).send({ reason: 'not-friends' });
  }
  let notSharedWith = friends.filter(id => !sharedWith.includes(id));
  
  //remove duplicates
  sharedWith = array.uniq(sharedWith);
  notSharedWith = array.uniq(notSharedWith);
  
  const setSharedWith = db.collection('contactinfos').findOneAndUpdate(
      { _id: ObjectID(contactID) },
      { $set: { sharedWith } }
    );
  const addAccess = db.collection('users').update(
      { _id: { $in: sharedWith.map(id => ObjectID(id)) } },
      { $addToSet: { hasAccessTo: contactID } },
      { multi: true }
    );
  const removeAccess = db.collection('users').update(
      { _id: { $in: notSharedWith.map(id => ObjectID(id)) } },
      { $pull: { hasAccessTo: contactID } },
      { multi: true }
    );
  Promise.all([setSharedWith, addAccess, removeAccess])
    .then(values => {
      logger.info(`${_id} updated sharing permissions for contact ${contactID}`);
      return res.send({ success: true });
    }).catch(err => {
      logger.error(`in updating sharing permissions for ${contactID} by user ${_id}`, err, {severe: 'data'});
      return res.status(400).send({ reason: 'unknown' });
    });
});

/*  /share/by-user
    POST
    id of contact information, ids of people to share with */


module.exports = router;