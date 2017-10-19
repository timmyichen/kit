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
    ids of contact information, id of user to share with */
router.post('/by-user', requireLogin, (req, res) => {
  const { db, logger } = req.app.locals;
  const { friends, _id, owns } = req.user;
  const { targetID, toShare } = req.body;
  let notOwnerError = false;
  toShare.forEach((info) => {
    if (!owns.includes(info)) notOwnerError = true;
  });
  if (notOwnerError) return res.status(403).send({ reason: 'not-owner' });
  if (!friends.includes(targetID + '')) {
    return res.status(403).send({ reason: 'not-friends' });
  }
  const noShare = owns.filter(id => !toShare.includes(id));
  const updateTarget = db.collection('user').update(
    { _id: ObjectID(targetID) },
    { $pushAll: { hasAccessTo: toShare }, $pullAll: { hasAccessTo: noShare } }
  );
  const updateSharedInfos = db.collection('contactinfos').update(
    { _id: { $in: toShare.map(id => ObjectID(id)) } },
    { $addToSet: { sharedWith: targetID } },
    { multi: true }
  );
  const updateUnsharedInfos = db.collection('contactinfos').update(
    { _id: { $in: noShare.map(id => ObjectID(id)) } },
    { $pull: { sharedWith: targetID } },
    { multi: true }
  );
  Promise.all([updateTarget, updateSharedInfos, updateUnsharedInfos])
    .then(response => {
      logger.info(`${_id} updated user-specific sharing settings with ${targetID}`);
      return res.send({ success: true });
    })
    .catch(err => {
      logger.error(`in updating user-specific sharing settings. user: ${_id}, target: ${targetID}`, err);
      return res.status(500).send({ reason: 'unknown' })
    });
});

module.exports = router;