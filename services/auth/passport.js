const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const keys = require('../../config/config').keys;

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
      
      passport.use(new GoogleStrategy(
        {
          clientID: keys.googleClientID,
          clientSecret: keys.googleClientSecret,
          callbackURL: '/auth/google/callback',
        },
        (accessToken, refreshToken, profile, done) => {
          db.collection('users').findOne({ authID: profile.id }, (err, doc) => {
            if (err) logger.error(`Error in database find (user for google auth): ${err}`);
            
            if(!doc) {
              const userObj = {
                authID: profile.id,
                email: profile.emails[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
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
              };
              
              db.collection('users').insertOne(userObj, (err, res) => {
                if (err) console.log(`Error in database insert (user registration google): ${err}`);
                logger.info(`user registered with email ${userObj.email}`);
                done(null, res.ops[0]);
              });
            } else {
              logger.info(`user with email ${profile.emails[0].value} logged in`);
              done(null, doc);
            }
          });
        }
      ));
      
    })
    .catch(err => {
      logger.error(`Error connecting to db for auth: ${err}`);
    });
}