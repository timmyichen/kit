const passport = require('passport');

const requiresWelcome = require('../../server-utils/validation').requiresWelcome;

function directAfterSuccess(req, res) {
  requiresWelcome(req.app.locals.db, req.user._id).then(unfinished => {
    if (unfinished) {
      res.redirect('/welcome');
    } else {
      res.redirect('/');
    }
  });
}

module.exports = app => {
  const logger = app.locals.logger;
  
  // Google
  
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  
  app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
    directAfterSuccess(req, res);
  });
  
  // Facebook
  
  app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
  
  app.get('/auth/facebook/callback', passport.authenticate('facebook'), (req, res) => {
    directAfterSuccess(req, res);
  })
  
  // Linkedin
  
  app.get('/api/current-user', (req, res) => {
    if (req.user) {
      res.send(req.user);
    } else {
      res.send({ error: true, message: 'no one is logged in!' });
    }
  });
  
  app.get('/auth/logout', (req, res) => {
    if (req.user) {
      req.session.destroy(err => {
        if (err) logger.error(`error on destroying session for user with email ${req.user.userEmail}`);
        res.redirect('/');
      });
    }
  });
};