'use strict';

const express = require('express');
const router = express.Router();

// Require the controllers
const dialogflow = require('../test/test-dialogflow')
//const dialogflow = require('.. .. '../controllers/dialogflow');

router.get('/', dialogflow.get_request);
router.post('/detectIntent/text', dialogflow.detectTextIntent);

module.exports = router;