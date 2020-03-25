'use strict';

const dialogflow = require('dialogflow');
const logger = require('../logger');
const config = require('../config');
const dialogflow_sessionid = require('../controllers/dialogflow_sessionid');
const dgf = require('../controllers/dialogflow');

const PROJECT_ID = config.projectId; //"gdfrestapi";
const PRIVATE_KEY = config.jsonKey.privateKey;
const CLIENT_EMAIL = config.jsonKey.clientEmail;

/**
 * For V2 webhook response format please ref. 
 * https://dialogflow.com/docs/reference/v1-v2-migration-guide-fulfillment#webhook_responses
 * @param {*} profileId = Viber user profile Id
 * @param {*} query = User query in 'text' format from Viber messenger
 * @param {*} languageCode = Supported language code. Default 'en-US'
 */
exports.detectTextIntent  = async function (req, res) {
    let result = null;
    let sessionId =null;
    try{   
        logger.log('info', "test-exports.detectTextIntent()> req.body= " + JSON.stringify(req.body), { logId: sessionId });
        let profileId = req.body.profileId;
        let query = req.body.query;
        let languageCode = req.body.languageCode;
        result  = await dgf.detectTextIntent(profileId, query, languageCode);
    }catch(e){
        logger.log('error', e.stack, {logId: sessionId});     
        result =  { 'error': e.message, 'responseMessage': 'Agent login failed' }
    } 
    finally{
        logger.log('info', "test-exports.detectTextIntent()> result= "+ JSON.stringify(result), {logId: sessionId });  
        res.status(200).json(result);
    }
}

exports.get_request = function (req, res) {
  res.send('This is Viber connector for EblDIA Google Dialogflow bot. Refer GitHub repo(EBL-DIA-Viber-Connector) for more details');
   logger.log('info','test-get_request()> This is Viber connector for EblDIA Google Dialogflow bot. Refer GitHub repo(EBL-DIA-Viber-Connector) for more details');
}