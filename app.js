const express = require('express');
const engines = require('consolidate');
const config = require('./config/config');
const MongoClient = require('mongodb').MongoClient;
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const apiRoutes = require('./api/index');
const requireSetup = require('./middlewares/requireSetup');

const app = express();

MongoClient.connect(config.keys.mongoURI, (err, db) => {
  if (err) console.log(`Failed to connect to the database: ${err.stack}`);
  
  app.locals.db = db;
  
  app.use(cookieParser());
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))

  app.use(session({
    secret: config.keys.sessionKey,
    store: new MongoStore({ db }),
    saveUninitialized: false,
    resave: false,
    name: 'connect.sid.kit',
  }));
  
  app.use(express.static('public'));
  require('./services/auth/passport');
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  require('./services/auth/authRoutes')(app);
  
  app.use('/api', apiRoutes);
  
  app.use('/', requireSetup);
  app.engine('njk', engines.nunjucks);
  app.set('view engine', 'njk');
  app.set('views', __dirname + '/views');
  
  app.get('*', (req, res) => {
    res.render('pages/index', {
      appname: config.APPNAME
    });
  });

  
  console.log('Successfully connected to db on server start');
  
  app.listen(config.PORT, function () {
    console.log(`App currently running; navigate to localhost:${config.PORT} in a web browser.`);
  });
});