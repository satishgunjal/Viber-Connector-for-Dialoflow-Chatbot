'use strict';

const express = require('express');
const router = express.Router();

// Require the controllers
const dialogflow = require('../controllers/dialogflow.js')
//const dialogflow = require('.. .. '../controllers/dialogflow');

router.get('/detectIntent/text', dialogflow.detectTextIntent);

module.exports = router;