const express = require('express');
const bodyParser = require('body-parser');

var router = express.Router();
const registration = require('./registrationRoutes');
const contactInfo = require('./contactRoutes');
const users = require('./userRoutes');
const sharing = require('./sharingRoutes');

router.use(express.static('public'));
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// const config = require('../config/config');
router.use('/registration', registration);
router.use('/user', users);
router.use('/share', sharing);
router.use('/', contactInfo);

//nothing matched our api requests, return 404
router.get('*', (req, res) => res.status(404).send({ error: 'Invalid API usage. Response not found.' }));

module.exports = router;