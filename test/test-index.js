const express = require('express');
const bodyParser = require('body-parser');
const route = require('../test/test-route'); // Imports routes for the users
const logger = require("../logger");

const PORT = 9000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/viberconnector', route);
app.get('/', (req, res) => res.send('Viber connector for Dialogflow chatbot'))
app.listen(PORT, () => {
    logger.log('info', "################## listening on port " + PORT + " ##################", { logId: "NULL" });
});