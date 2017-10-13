const passport = require('passport');

const requiresWelcome = require('../../server-utils/validation').requiresWelcome;

module.exports = app => {
  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
  }));
  
  app.get(
    '/auth/google/callback',
    passport.authenticate('google'),
    (req, res) => {
      requiresWelcome(req.app.locals.db, req.user._id).then(unfinished => {
        if (unfinished) {
          res.redirect('/welcome');
        } else {
          res.redirect('/');
        }
      })
    }
  );
  
  app.get('/api/current_user', (req, res) => {
    if (req.user) {
      res.send(req.user);
    } else {
      res.send({ error: true, message: 'no one is logged in!' })
    }
  });
  
  app.get('/auth/logout', (req, res) => {
    if (req.user) {
      req.session.destroy(err => {
        if (err) console.log(`error on destroying session for user with email ${req.user.userEmail}`)
        res.redirect('/');
      });
    }
  });
};