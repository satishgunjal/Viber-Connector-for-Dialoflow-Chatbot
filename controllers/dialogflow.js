'use strict';

const dialogflow = require('dialogflow');
const logger = require('../logger');
const config = require('../config');
const dialogflow_sessionid = require('../controllers/dialogflow_sessionid');

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
exports.detectTextIntent  = async function (profileId, query, languageCode = 'en-US') {
  let result = null;
  let sessionId =null;
  let isEndOfConversation = 'false';
  try{      
      logger.log('info', "exports.detectTextIntent()> I/P> profileId= " + profileId, {logId: sessionId}); 
      logger.log('info', "exports.detectTextIntent()> I/P> query= " + query, {logId: sessionId}); 
      logger.log('info', "exports.detectTextIntent()> I/P> languageCode= " + languageCode, {logId: sessionId}); 
      
      if(isEndOfConversation){
        sessionId = dialogflow_sessionid.mapSessionIdCreate(profileId);   
      }else if(dialogflow_sessionid.isSessionIdExpired(profileId)){ //check for time between last two messages
        sessionId = dialogflow_sessionid.mapSessionIdCreate(profileId);        
      }else{
        sessionId = dialogflow_sessionid.mapSessionIdGet(profileId)[0]; 
        logger.log('info', `exports.detectTextIntent()> Using existing sessionId ($sessionId)`, {logId: sessionId}); 
        dialogflow_sessionid.updateTimestamp(profileId);
      }    

      //Uncomment the method you want test with
      //detectTextIntent1(query,PROJECT_ID);
      result  = await detectTextIntent2(PROJECT_ID, sessionId, query, languageCode)
      isEndOfConversation = result.diagnosticInfo.fields.end_conversation.boolValue;
      logger.log('info', 'exports.detectTextIntent()> isEndOfConversation= '+ isEndOfConversation, {logId: sessionId}); 
        
  }
  catch(e){
    logger.log('error', e.stack, {logId: sessionId});
  } 
  finally{
    logger.log('info', "exports.detectTextIntent()> result= "+ JSON.stringify(result), {logId: sessionId });  
    return result;
  }
}

/**
 * Note: In this method instead of using environment variable we are using required parameters(private_key, client_email) from JSON key
 * In 'detectTextIntent1' Dialogflow API will environment variable "GOOGLE_APPLICATION_CREDENTIALS" for authentication *  
 * @param {*} projectId 
 * @param {*} sessionId 
 * @param {*} query 
 * @param {*} languageCode 
 */
async function detectTextIntent2(projectId, sessionId, query, languageCode) {
  let result = null;
  try{
    logger.log('info', "detectTextIntent2()> I/P> projectId= " + projectId, {logId: sessionId}); 
    logger.log('info', "detectTextIntent2()> I/P> query= " + query, {logId: sessionId}); 
    logger.log('info', "detectTextIntent2()> I/P> languageCode= " + languageCode, {logId: sessionId});

    let config = {
      credentials: {
        private_key: PRIVATE_KEY,
        client_email: CLIENT_EMAIL
      }
    }
    const sessionClient = new dialogflow.SessionsClient(config);
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);

    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
    };
    logger.log('info', "detectTextIntent2()> request " + JSON.stringify(request) , { logId: sessionId });

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    logger.log('info', 'detectTextIntent2()> Response received ', {logId: sessionId});    
    result = responses[0].queryResult;
    logger.log('info', `detectTextIntent2()> Query: ${result.queryText}`, {logId: sessionId}); 
    logger.log('info', `detectTextIntent2()> Response: ${result.fulfillmentText}`, {logId: sessionId});
    if (result.intent) {
      logger.log('info', `detectTextIntent2()> Intent: ${result.intent.displayName}`, {logId: sessionId});
    } else {
      logger.log('info', 'detectTextIntent2()> No intent matched.', {logId: sessionId});
    }
  }catch(e){
    logger.log('error', e.stack, {logId: sessionId});
  } 
  finally{
    //logger.log('info', "exports.detectTextIntent2()> result= "+ JSON.stringify(result), {logId: sessionId });  
    return result;
  }
}

/**
 * Note: In this method Dialogflow API will environment variable "GOOGLE_APPLICATION_CREDENTIALS" for authentication
 * In 'detectTextIntent2' instead of using environment variable we are using required parameters(private_key, client_email) from JSON key
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function detectTextIntent1(query, projectId) {
    
    console.log("Testing detectTextIntent1");
    // A unique identifier for the given session
    const sessionId = uuid.v4();
    console.log(`detectTextIntent1()>  sessionId: ${sessionId}`);
    // Create a new session
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);
    try{
        // The text query request.
        const request = {
            session: sessionPath,
            queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: query,
                // The language used by the client (en-US)
                languageCode: 'en-US',
            },
            },
        };
    
        // Send request and log result
        const responses = await sessionClient.detectIntent(request);
        console.log('detectTextIntent1()> Detected intent');
        const result = responses[0].queryResult;
        logger.log('info', "detectTextIntent1()> result " + JSON.stringify(result) , { logId: "NULL" });

        console.log(`detectTextIntent1()>  Query: ${result.queryText}`);
        console.log(`detectTextIntent1()>  Response: ${result.fulfillmentText}`);
        if (result.intent) {
            console.log(`detectTextIntent1()>  Intent: ${result.intent.displayName}`);
        } else {
            console.log(`detectTextIntent1()>  No intent matched.`);
        }
    }
    catch(e){
        console.log(e);
    }
    
  }