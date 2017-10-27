const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const keys = require('../../config/config').keys;

function getUserObject(profile, provider) {
  return {
    authID: `${provider}:${profile.id}`,
    email: profile.emails[0].value,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    fullName: profile.name.givenName + ' ' + profile.name.familyName,
    gender: profile.gender,
    lastActive: Date.now(),
    joined: Date.now(),
    username: null,
    birthday: null,
    owns: [],
    hasAccessTo: [],
    friends: [],
    requested: [],
    pendingRequests: [],
    blocked: [],
    blockedBy: [],
    notifications: [],
    groups: [],
  };
}

function findOrInsert(db, logger, profile, provider, done) {
  db.collection('users').findOne({ authID: `${provider}:${profile.id}` }, (err, doc) => {
    if (err) {
      logger.error(`Error in database find (user for google auth): ${err}`);
      done(null, false);
    }
    
    if(!doc) {
      const userObj = getUserObject(profile, provider);
      
      db.collection('users').insertOne(userObj, (err, res) => {
        if (err) {
          logger.error(`Error in database insert (user registration ${provider}):`, err);
          done(null, false);
        }
        logger.info(`user registered with through ${provider}: email ${userObj.email}`);
        done(null, res.ops[0]);
      });
    } else {
      logger.info(`user with email ${profile.emails[0].value} logged in`);
      done(null, doc);
    }
  });
}

module.exports = app => {
  const logger = app.locals.logger;
  MongoClient.connect(keys.mongoURI)
    .then(db => {
      logger.info('Successfully connected to db for auth');
      
      passport.serializeUser((user, done) => {
        done(null, user._id);
      });
      
      passport.deserializeUser((id, done) => {
        db.collection('users').findOne(
          { _id: ObjectID(id) }, 
          // { blocked: 0, blockedBy: 0 }, 
          (err, user) => {
            if (err) return done(err);
            done(null, user);
          }
        );
      });
      
      // Google
      
      passport.use(new GoogleStrategy(
        {
          clientID: keys.googleClientID,
          clientSecret: keys.googleClientSecret,
          callbackURL: '/auth/google/callback',
        },
        (accessToken, refreshToken, profile, done) => {
          findOrInsert(db, logger, profile, 'google', done);
        }
      ));
      
      // Facebook 
      
      passport.use(new FacebookStrategy(
        {
          clientID: keys.facebookClientID,
          clientSecret: keys.facebookClientSecret,
          callbackURL: '/auth/facebook/callback',
          profileFields: ['id', 'first_name', 'last_name', 'email']
        },
        (accessToken, refreshToken, profile, done) => {
          findOrInsert(db, logger, profile, 'facebook', done);
        }
      ));
      
    })
    .catch(err => {
      logger.error(`Error connecting to db for auth: ${err}`);
    });
}