const ObjectID = require('mongodb').ObjectID;

//if they have not finished setting up their account, redirect them to registration

module.exports = (req, res, next) => {
	const { db, logger } = req.app.locals;
  if (!req.user) {
    if (req.originalUrl === '/welcome') {
      return res.redirect('/');
    } else {
      return next();
    }
  }
  db.collection('users')
    .find({ _id: ObjectID(req.user._id) })
    .toArray((err, docs) => {
      if (err) {
        logger.error(`error in 'require setup' middleware db query`, err);
        return res.status(500).send({ error: 'unexpected error, try again' });
      }
      if (!docs[0].firstName || !docs[0].lastName || !docs[0].username ||
          !docs[0].email || !docs[0].birthday || !docs[0].gender) { // if something is incomplete
        if (req.originalUrl === '/welcome') {
          return next();
        }
        return res.redirect('/welcome');
      } else if (req.originalUrl === '/welcome') {
        return res.redirect('/')
      } else {
        return next();
      }
    });
};