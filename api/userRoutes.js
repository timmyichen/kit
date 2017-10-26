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

/*  /api/user/search
    GET
    params: ?query=
    returns top 20 results from search ordered by mutual friends */
router.get('/search', requireLogin, (req, res) => {
  const { query } = req.query;
  const { _id, friends } = req.user;
  const { db, logger } = req.app.locals;
  if (query.length === 0) {
    return res.send([]);
  }
  const queryRegex = new RegExp(query, 'i');
  const friendIDs = friends.map(f => ObjectID(f));
  friendIDs.push(_id);
  db.collection('users').find(
    // { $or: [{ fullName: { $regex: queryRegex } }, { username: { $regex: queryRegex } }] },
    { $and: [
      { _id: { $not: { $in: friendIDs } } },
      { $or: [{ fullName: queryRegex }, { username: queryRegex }] },
    ]},
    { _id: 1, fullName: 1, username: 1, friends: 1 }
  ).toArray((err, docs) => {
    if(err) {
      logger.error(`in doing search for user ${_id} and query ${query}`, err);
      return res.status(500).send({ reason: 'unknown' });
    }
    const withMutualFriends = docs.map(user => {
      user.mutualCount = friends.filter(f => user.friends.includes(f)).length;
      delete user.friends;
      return user;
    });
    res.send(withMutualFriends);
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
    { _id: 1, firstName: 1, lastName: 1, lastActive: 1, username: 1, birthday: 1 }
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
  
  const addedToUser = db.collection('users').findOneAndUpdate(
    { _id: ObjectID(userID) },
    { $push: { requested: targetID } }
  );
  const addedToTarget = db.collection('users').findOneAndUpdate(
    { _id: ObjectID(targetID) },
    { $push: { pendingRequests: userID } }
  );
  Promise.all([addedToUser, addedToTarget])
    .then(values => {
      logger.info(`${userID} requested ${targetID} as a friend`);
      return res.send({ success: true });
    })
    .catch(err => {
      logger.error(`in adding ${userID} to 'pendingRequests' of ${targetID}`, err, {severe: 'data'});
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
  const removedFromUser = db.collection('users').findOneAndUpdate(
    { _id: ObjectID(userID) },
    { $pull: { requested: targetID } }
  );
  const removedFromTarget = db.collection('users').findOneAndUpdate(
    { _id: ObjectID(targetID) },
    { $pull: { pendingRequests: userID } }
  );
  Promise.all([removedFromUser, removedFromTarget])
    .then(values => {
      logger.info(`${userID} rescinded friend request to${targetID}`);
      return res.send({ success: true });
    })
    .catch(err => {
      logger.error(`removing ${userID} from 'pendingRequests' of ${targetID}`, err, {severe: 'data'});
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
  db.collection('contactinfos').find({ owner: { $in: [userID, targetID] } }).toArray((err, docs) => {
    if (err) {
      logger.error(`in removing ${userID} from everything of ${targetID} (blocking)`, err);
      return res.status(500).send({ reason: 'unknown' });
    }
    const infoIDs = docs.map(doc => doc._id + '');
    const updateUsers = db.collection('users').update(
      { _id: { $in: [ObjectID(userID), ObjectID(targetID)] } }, 
      { $pullAll: { friends: [ userID, targetID ], hasAccessTo: infoIDs } },
      { multi: true }
    );
    const updateContacts = db.collection('contactinfos').update(
      { owner: { $in: [userID, targetID] } },
      { $pullAll: { sharedWith: [userID, targetID] } },
      { multi: true }
    );
    Promise.all([updateUsers, updateContacts])
      .then(response => {
        logger.info(`${userID} unfriended ${targetID}`);
        return res.status(200).send({ success: true });
      }).catch(err => {
        logger.error(`when ${userID} tried to unfriend ${targetID}`, err);
        return res.status(500).send({ reason: 'unknown' });
      });  
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
  db.collection('contactinfos').find({ owner: { $in: [userID, targetID] } }).toArray((err, docs) => {
    if (err) {
      logger.error(`in removing ${userID} from everything of ${targetID} (blocking)`, err);
      return res.status(500).send({ reason: 'unknown' });
    }
    const infoIDs = docs.map(doc => doc._id + '');
    const updatedUser = db.collection('users').findOneAndUpdate(
      { _id: ObjectID(userID) },
      { $pull: { friends: targetID, requested: targetID, pendingRequests: targetID },
        $push: { blocked: targetID } ,
        $pullAll: { hasAccessTo: infoIDs }
      }
    );
    const updatedTarget = db.collection('users').findOneAndUpdate(
      { _id: ObjectID(targetID) },
      { $pull: { friends: userID, requested: userID, pendingRequests: userID },
        $push: { blockedBy: userID },
        $pullAll: { hasAccessTo: infoIDs }
      }
    );
    const updateContacts = db.collection('contactinfos').update(
      { owner: { $in: [userID, targetID] } },
      { $pullAll: { sharedWith: [userID, targetID] } },
      { multi: true }
    ); //need to update users hasAccessTo doc as well
    Promise.all([updatedUser, updatedTarget, updateContacts])
      .then(values => {
        logger.info(`${userID} blocked ${targetID}`);
        return res.send({ success: true });
      })
      .catch(err => {
        logger.error(`in removing ${userID} from everything of ${targetID} (blocking)`, err, {severe: 'data'});
        return res.status(500).send({ reason: 'unknown' });
      });
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
  const updatedUser = db.collection('users').findOneAndUpdate(
    { _id: ObjectID(userID) },
    { $pull: { blocked: targetID } }
  );
  const updatedTarget = db.collection('users').findOneAndUpdate(
    { _id: ObjectID(targetID) },
    { $pull: { blockedBy: userID } }
  );
  Promise.all([updatedUser, updatedTarget])
    .then(values => {
      logger.info(`${userID} unblocked ${targetID}`);
      return res.send({ success: true });
    })
    .catch(err => {
      logger.error(`in removing ${userID} from 'blockedBy' of ${targetID} (unblocking)`, err, {severe: 'data'});
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
  const updatedUser = db.collection('users').findOneAndUpdate(
    { _id: ObjectID(userID) },
    { $push: { friends: targetID }, $pull: { pendingRequests: targetID } }
  );
  const updatedTarget = db.collection('users').findOneAndUpdate(
    { _id: ObjectID(targetID) },
    { $push: { friends: userID }, $pull: { requested: userID } }
  );
  Promise.all([updatedUser, updatedTarget])
    .then(values => {
      logger.info(`${userID} accepted friend request from ${targetID}`);
      res.send({ success: true });
    })
    .catch(err => {
      logger.error(`in moving ${userID} from 'pendingRequests' to 'friends' of ${targetID}`, err, {severe: 'data'});
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
  const updatedUser = db.collection('users').findOneAndUpdate(
    { _id: ObjectID(userID) },
    { $pull: { pendingRequests: targetID } }
  );
  const updatedTarget = db.collection('users').findOneAndUpdate(
    { _id: ObjectID(targetID) },
    { $pull: { requested: userID } }
  );
  Promise.all([updatedUser, updatedTarget])
    .then(values => {
      logger.info(`${userID} declined friend request from ${targetID}`);
      res.send({ success: true });
    })
    .catch(err => {
      logger.error(`in removing ${userID} from 'requested' of ${targetID}`, err, {severe: 'data'});
      return res.status(500).send({ reason: 'unknown' });
    });
});

module.exports = router;