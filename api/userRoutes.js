const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;

const requireLogin = require('../middlewares/requireLogin');

/*  /api/user/profile/:username
    GET
    public information about the user */
router.get('/profile/:username', requireLogin, (req, res) => {
  const { username } = req.params;
  const { db, logger } = req.app.locals;
  db.collection('users').findOne(
      { username },
      { _id: 1, firstName: 1, lastName: 1, username: 1, }
    )
    .then(response => {
      return res.send(response);
    })
    .catch(err => {
      logger.error(`in fetching profile w/username ${username}`, err);
      return res.status(500).send({ reason: 'unknown' });
    });
});

/*  /api/user/friends-list
    GET
    array of friends (firstname, lastname, username) */
router.get('/friends-list', requireLogin, (req, res) => {
  const { db, logger } = req.app.locals;
  const friendsList = req.user.friends.map(friend => ObjectID(friend));
  db.collection('users').find(
    { _id: { $in: friendsList }},
    { _id: 1, firstName: 1, lastName: 1, lastLogin: 1, username: 1, birthday: 1 }
  ).toArray((err, docs) => {
    if (err) {
      logger.error(`in fetching friends list for ${req.user._id + ''}`, err);
      return res.status(500).send({ reason: 'unknown' })
    }
    return res.send(docs);
  });
})

/*  /api/user/add
    POST
    Username of friend to be added */
router.post('/add/', requireLogin, (req, res) => {
  const { db, logger } = req.app.locals;
  const targetID = req.body.targetID;
  const userID = req.user._id + '';
  if (req.user.blockedBy.includes(targetID)) {
    return res.status(403).send({ reason: 'no-access' });
  } else if (req.user.requested.includes(targetID)) {
    return res.status(403).send({ reason: 'duplicate-request' });
  } else if (req.user.friends.includes(targetID)) {
    return res.status(403).send({ reason: 'already-friends' });
  }
  db.collection('users').findOneAndUpdate(
    { _id: ObjectID(userID) },
    { $push: { requested: targetID } }
  ).then(response => {
    db.collection('users').findOneAndUpdate(
      { _id: ObjectID(targetID) },
      { $push: { pendingRequests: userID } }
    ).then(response => {
      logger.info(`${req.user.email}(${userID}) requested ${req.body.name}(${targetID}) as a friend`);
      return res.status(200).send({ success: true });
    }).catch(err => {
      logger.error(`in adding ${userID} to 'pendingRequests' of ${targetID}`, err, {severe: 'data'});
      return res.status(500).send({ reason: 'unknown' });
    });
  }).catch(err => {
    logger.error(`in adding ${targetID} to 'requested' of ${userID}`, err);
    return res.status(500).send({ reason: 'unknown' });
  });
});
  
/*  /api/user/rescind
    POST
    Username of friend to be rescinded from requested list */
router.post('/rescind', requireLogin, (req, res) => {
  const { db, logger } = req.app.locals;
  const targetID = req.body.targetID;
  const userID = req.user._id + '';
  if (!req.user.requested.includes(targetID)) {
    return res.status(403).send({ reason: 'no-request-found' });
  } else if (req.user.friends.includes(targetID)) {
    return res.status(403).send({ reason: 'already-friends' });
  }
  db.collection('users').findOneAndUpdate(
    { _id: ObjectID(userID) },
    { $pull: { requested: targetID } }
  ).then(response => {
    db.collection('users').findOneAndUpdate(
      { _id: ObjectID(targetID) },
      { $pull: { pendingRequests: userID } }
    ).then(response => {
      logger.info(`${req.user.email}(${userID}) rescinded friend request to ${req.body.name}(${targetID})`);
      return res.status(200).send({ success: true });
    }).catch(err => {
      logger.error(`removing ${userID} from 'pendingRequests' of ${targetID}`, err, {severe: 'data'});
      return res.status(500).send({ reason: 'unknown' });
    });
  }).catch(err => {
    logger.error(`in removing ${targetID} from 'requested' of ${userID}`, err);
    return res.status(500).send({ reason: 'unknown' });
  });
});

/*  /api/user/remove
    POST
    Username of friend to be removed*/
router.post('/remove', requireLogin, (req, res) => {
  const { db, logger } = req.app.locals;
  const targetID = req.body.targetID;
  const userID = req.user._id + '';
  if (!req.user.friends.includes(targetID)) {
    return res.status(403).send({ 'reason': 'not-friends' });
  }
  db.collection('users').update(
    { _id: { $in: [ObjectID(userID), ObjectID(targetID)] } }, 
    { $pullAll: { friends: [ userID, targetID ] } },
    { multi: true }
  ).then(response => {
    logger.info(`${userID} unfriended ${targetID}`);
    return res.status(200).send({ success: true });
  }).catch(err => {
    logger.error(`when ${userID} tried to unfriend ${targetID}`, err);
    return res.status(500).send({ reason: 'unknown' });
  });
});

/*  /api/user/block
    POST
    Username to be blocked */
router.post('/block', requireLogin, (req, res) => {
  const { db, logger } = req.app.locals;
  const targetID = req.body.targetID;
  const userID = req.user._id + '';
  if (req.user.blocked.includes(targetID)) {
    return res.send({ reason: 'already-blocked' });
  }
  db.collection('users').findOneAndUpdate(
    { _id: ObjectID(userID) },
    { $pull: { friends: targetID, requested: targetID, pendingRequests: targetID }, $push: { blocked: targetID } }
  ).then(response => {
    db.collection('users').findOneAndUpdate(
      { _id: ObjectID(targetID) },
      { $pull: { friends: userID, requested: userID, pendingRequests: userID }, $push: { blockedBy: userID } }
    ).then(response => {
      logger.info(`${req.user.email}${userID} blocked ${req.body.name}(${targetID})`);
      return res.status(200).send({ success: true });
    }).catch(err => {
      logger.error(`in removing ${userID} from everything of ${targetID} (blocking)`, err, {severe: 'data'});
      return res.status(500).send({ reason: 'unknown' });
    });
  }).catch(err => {
    logger.error(`in removing ${targetID} from everything of ${userID} (blocking)`, err);
    return res.status(500).send({ reason: 'unknown' });
  });
})

/*  /api/user/unblock
    POST
    Username to be unblocked */
router.post('/unblock', requireLogin, (req, res) => {
  const { db, logger } = req.app.locals;
  const targetID = req.body.targetID;
  const userID = req.user._id + '';
  if (!req.user.blocked.includes(targetID)) {
    return res.send({ reason: 'not-blocked' });
  }
  db.collection('users').findOneAndUpdate(
    { _id: ObjectID(userID) },
    { $pull: { blocked: targetID } }
  ).then(response => {
    db.collection('users').findOneAndUpdate(
      { _id: ObjectID(targetID) },
      { $pull: { blockedBy: userID } }
    ).then(response => {
      logger.info(`${req.user.email}${userID} unblocked ${req.body.name}(${targetID})`);
      return res.status(200).send({ success: true });
    }).catch(err => {
      logger.error(`in removing ${userID} from 'blockedBy' of ${targetID} (unblocking)`, err, {severe: 'data'});
      return res.status(500).send({ reason: 'unknown' });
    });
  }).catch(err => {
    logger.error(`in removing ${targetID} from 'blocked' of ${userID} (unblocking)`, err);
    return res.status(500).send({ reason: 'unknown' });
  });
})

/*  /api/user/pending-requests
    GET
    names and usernames of people who have requested user */
router.get('/pending-requests', requireLogin, (req, res) => {
  const reqsArray = req.user.pendingRequests.map(id => ObjectID(id));
  const { db, logger } = req.app.locals;
  const projection = { _id: 1, firstName: 1, lastName: 1, username: 1 };
  db.collection('users').find({ _id: { $in: reqsArray }}, projection).toArray((err, docs) => {
    if (err) {
      logger.error(`in getting pending requests for ${req.user._id}`, err);
      return res.status(500).send({ reason: 'unknown' });
    }
    res.send(docs);
  });
});

/*  /api/user/accept-friend
    POST
    ID of friend to confirm */
router.post('/accept-friend', requireLogin, (req, res) => {
  const { db, logger } = req.app.locals;
  const targetID = req.body.targetID;
  const userID = req.user._id + '';
  if (!req.user.pendingRequests.includes(targetID)){
    return res.status(403).send({ reason: 'no-request-found' });
  }
  db.collection('users').findOneAndUpdate(
    { _id: ObjectID(userID) },
    { $push: { friends: targetID }, $pull: { pendingRequests: targetID } }
  ).then(response => {
    db.collection('users').findOneAndUpdate(
      { _id: ObjectID(targetID) },
      { $push: { friends: userID }, $pull: { requested: userID } }
    ).then(response => {
      logger.info(`${userID} accepted friend request from ${targetID}`);
      res.send({ success: true });
    }).catch(err => {
      logger.error(`in moving ${userID} from 'pendingRequests' to 'friends' of ${targetID}`, err, {severe: 'data'});
      return res.status(500).send({ reason: 'unknown' });
    });
  }).catch(err => {
    logger.error(`in moving ${targetID} from 'requested' to 'friends' of ${userID}`, err);
    return res.status(500).send({ reason: 'unknown' });
  });
});

/*  /api/user/decline-friend
    POST
    ID of friend to decline */
router.post('/decline-friend', requireLogin, (req, res) => {
  const { db, logger } = req.app.locals;
  const targetID = req.body.targetID;
  const userID = req.user._id + '';
  if (!req.user.pendingRequests.includes(targetID)){
    return res.status(403).send({ reason: 'no-request-found' });
  }
  db.collection('users').findOneAndUpdate(
    { _id: ObjectID(userID) },
    { $pull: { pendingRequests: targetID } }
  ).then(response => {
    db.collection('users').findOneAndUpdate(
      { _id: ObjectID(targetID) },
      { $pull: { requested: userID } }
    ).then(response => {
      logger.info(`${userID} declined friend request from ${targetID}`);
      res.send({ success: true });
    }).catch(err => {
      logger.error(`in removing ${userID} from 'requested' of ${targetID}`, err, {severe: 'data'});
      return res.status(500).send({ reason: 'unknown' });
    });
  }).catch(err => {
    logger.error(`in removing ${targetID} from 'pendingRequests' of ${userID}`, err);
    return res.status(500).send({ reason: 'unknown' });
  });
});

module.exports = router;