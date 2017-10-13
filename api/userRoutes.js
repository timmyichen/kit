const router = require('express').Router();
const ObjectID = require('mongodb').ObjectID;

const requireLogin = require('../middlewares/requireLogin');

/*  /api/user/profile/:username
    GET
    public information about the user */
router.get('/profile/:username', requireLogin, (req, res) => {
  const { username } = req.params;
  const db = req.app.locals.db;
  db.collection('users').findOne(
      { username },
      { _id: 1, firstName: 1, lastName: 1, username: 1, }
    )
    .then(response => {
      res.send(response);
    })
    .catch(err => {
      console.log(`ERROR in fetching profile w/username ${username}: ${err}`);
      return res.status(500).send({ error: true, reason: 'unknown' });
    });
});


/*  /api/user/add
    POST
    Username of friend to be added */
router.post('/add/', requireLogin, (req, res) => {
  const targetID = req.body.targetID;
  const userID = req.user._id + '';
  if (req.user.blockedBy.includes(targetID)) {
    return res.status(403).send({ error: true, reason: 'no-access' });
  } else if (req.user.requested.includes(targetID)) {
    return res.status(403).send({ error: true, reason: 'duplicate-request' });
  }
  const db = req.app.locals.db;
  db.collection('users').findOneAndUpdate(
    { _id: ObjectID(userID) },
    { $push: { requested: targetID } }
  ).then(response => {
    db.collection('users').findOneAndUpdate(
      { _id: ObjectID(targetID) },
      { $push: { pendingRequests: userID } }
    ).then(response => {
      console.log(`${req.user.email}(${userID}) requested ${req.body.name}(${targetID}) as a friend`);
      return res.status(200).send({ success: true });
    }).catch(err => {
      console.log(`REALLY BAD ERROR INVOLVING DATA THAT NEEDS FIXING`);
      console.log(`in adding ${userID} to 'pendingRequests' of ${targetID}: ${err}`);
      return res.status(500).send({ error: true, reason: 'unknown' });
    });
  }).catch(err => {
    console.log(`ERROR in adding ${targetID} to 'requested' of ${userID}: ${err}`);
    return res.status(500).send({ error: true, reason: 'unknown' });
  });
});
  
/*  /api/user/rescind
    POST
    Username of friend to be rescinded from requested list */
router.post('/rescind/', requireLogin, (req, res) => {
  const targetID = req.body.targetID;
  const userID = req.user._id + '';
  if (!req.user.requested.includes(targetID)) {
    return res.status(403).send({ error: true, reason: 'no-request-found' });
  }
  const db = req.app.locals.db;
  db.collection('users').findOneAndUpdate(
    { _id: ObjectID(userID) },
    { $pull: { requested: targetID } }
  ).then(response => {
    db.collection('users').findOneAndUpdate(
      { _id: ObjectID(targetID) },
      { $pull: { pendingRequests: userID } }
    ).then(response => {
      console.log(`${req.user.email}(${userID}) rescinded friend request to ${req.body.name}(${targetID})`);
      return res.status(200).send({ success: true });
    }).catch(err => {
      console.log(`REALLY BAD ERROR INVOLVING DATA THAT NEEDS FIXING`);
      console.log(`in removing ${userID} from 'pendingRequests' of ${targetID}: ${err}`);
      return res.status(500).send({ error: true, reason: 'unknown' });
    });
  }).catch(err => {
    console.log(`ERROR in removing ${targetID} from 'requested' of ${userID}: ${err}`);
    return res.status(500).send({ error: true, reason: 'unknown' });
  });
});

/*  /api/user/remove
    POST
    Username of friend to be removed*/


/*  /api/user/block
    POST
    Username to be blocked */
// router.post('/block', requireLogin, (req, res) => {
//   const targetID = req.body.targetID;
//   const userID = req.user._id + '';
//   if (!req.user.blocked.includes(targetID)) {
//     return res.send({ error: true, reason: 'duplicate-request' });
//   }
//   const db = req.app.locals.db;
//   db.collection('users').findOneAndUpdate(
//     { _id: ObjectID(userID) },
//     { $pull: { friends: targetID, requested: targetID }, $push: { blocked: targetID } }
//   ).then(response => {
//     db.collection('users').findOneAndUpdate(
//       { _id: ObjectID(targetID) },
//       { $pull: { pendingRequests: userID } }
//     ).then(response => {
//       console.log(`${req.user.email} rescinded friend request to ${req.body.name}(${targetID})`);
//       res.status(200).send({ success: true });
//     }).catch(err => {
//       console.log(`REALLY BAD ERROR INVOLVING DATA THAT NEEDS FIXING`);
//       console.log(`in removing ${userID} from 'pendingRequests' of ${targetID}: ${err}`);
//     });
//   }).catch(err => {
//     console.log(`ERROR in removing ${targetID} from 'requested' of ${userID}: ${err}`);
//     res.status(500).send({ error: true, reason: 'unknown' });
//   });
// })

/*  /api/user/unblock
    POST
    Username to be unblocked */

/*  /api/user/pending-requests
    GET
    names and usernames of people who have requested user */
router.get('/pending-requests', requireLogin, (req, res) => {
  const reqsArray = req.user.pendingRequests.map(id => ObjectID(id));
  const db = req.app.locals.db;
  const projection = { _id: 1, firstName: 1, lastName: 1, username: 1 };
  db.collection('users').find({ _id: { $in: reqsArray }}, projection).toArray((err, docs) => {
    if (err) {
      console.log(`ERROR in getting pending requests for ${req.user._id}: ${err}`);
      return res.status(500).send({ error: true, reason: 'unknown' });
    }
    res.send(docs);
  });
});

/*  /api/user/accept-friend
    POST
    ID of friend to confirm */
router.post('/accept-friend', requireLogin, (req, res) => {
  const targetID = req.body.targetID;
  const userID = req.user._id + '';
  if (!req.user.pendingRequests.includes(targetID)){
    return res.status(403).send({ error: true, reason: 'no-request-found' });
  }
  const db = req.app.locals.db;
  db.collection('users').findOneAndUpdate(
    { _id: ObjectID(userID) },
    { $push: { friends: targetID }, $pull: { pendingRequests: targetID } }
  ).then(response => {
    db.collection('users').findOneAndUpdate(
      { _id: ObjectID(targetID) },
      { $push: { friends: userID }, $pull: { requested: userID } }
    ).then(response => {
      console.log(`${userID} accepted friend request from ${targetID}`);
      res.send({ success: true });
    }).catch(err => {
      console.log(`REALLY BAD ERROR INVOLVING DATA THAT NEEDS FIXING`);
      console.log(`in moving ${userID} from 'pendingRequests' to 'friends' of ${targetID}: ${err}`);
      return res.status(500).send({ error: true, reason: 'unknown' });
    });
  }).catch(err => {
    console.log(`ERROR in moving ${targetID} from 'requested' to 'friends' of ${userID}: ${err}`);
    return res.status(500).send({ error: true, reason: 'unknown' });
  });
});

/*  /api/user/decline-friend
    POST
    ID of friend to decline */
router.post('/decline-friend', requireLogin, (req, res) => {
  const targetID = req.body.targetID;
  const userID = req.user._id;
  if (!req.user.pendingRequests.includes(targetID)){
    return res.status(403).send({ error: true, reason: 'no-request-found' });
  }
  const db = req.app.locals.db;
  db.collection('users').findOneAndUpdate(
    { _id: ObjectID(userID) },
    { $pull: { pendingRequests: targetID } }
  ).then(response => {
    db.collection('users').findOneAndUpdate(
      { _id: ObjectID(targetID) },
      { $pull: { requested: userID } }
    ).then(response => {
      console.log(`${userID} declined friend request from ${targetID}`);
      res.send({ success: true });
    }).catch(err => {
      console.log(`REALLY BAD ERROR INVOLVING DATA THAT NEEDS FIXING`);
      console.log(`in removing ${userID} from 'requested' of ${targetID}: ${err}`);
      return res.status(500).send({ error: true, reason: 'unknown' });
    });
  }).catch(err => {
    console.log(`ERROR in removing ${targetID} from 'pendingRequests' of ${userID}: ${err}`);
    return res.status(500).send({ error: true, reason: 'unknown' });
  });
});


/*  /api/user/ping-info
    POST
    ID of info to be pinged */

module.exports = router;