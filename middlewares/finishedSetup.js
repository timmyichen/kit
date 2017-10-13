const ObjectID = require('mongodb').ObjectID;

// if they have finished setting up but are trying to post to /registration/new anyway

module.exports = (req, res, next) => {
	const db = req.app.locals.db;
	if (!req.user) {
	  return res.redirect('/');
	}
  db.collection('users')
    .find({ _id: ObjectID(req.user._id) })
    .toArray((err, docs) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ error: 'unexpected error, try again' });
      }
      if (docs[0].firstName && docs[0].lastName && docs[0].username &&
          docs[0].email && docs[0].birthday && docs[0].gender) { //if nothing is incomplete
        res.status(500).send({ error: 'already registered' });
      } else {
        next();
      }
    });
};