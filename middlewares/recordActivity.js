const ObjectID = require('mongodb').ObjectID;

module.exports = (req, res, next) => {
	const db = req.app.locals.db;
	if (req.user && !req.url.includes('favicon')) {
		db.collection('users').update(
		  { _id: ObjectID(req.user._id) },
		  { $set: { lastActive: Date.now() } }
		);
	}
	next();
}