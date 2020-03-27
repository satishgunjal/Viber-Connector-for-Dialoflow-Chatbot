'use strict';

const dialogflow = require('dialogflow');
const uuid = require('uuid');
const logger = require('../logger');
const config = require('../config');

const SESSION_ID_TIMEOUT_IN_MINUTES = config.sessionIdTimeoutInMinutes;

//To store sessionId for each Viber profileId
let mapSessionId = new Map();

function generateSessionId()
{
    return uuid.v4();
}

/**
 * To check if sessionId is expired or not
 * Get session details(sessionId and last message timestamp)
 * If session details are null means its users first interaction since start of Viber Connector>> need to create new sessionId
 * If session details exists but diff between last message and current message is more than configured time >> create new sessionId
 * If session details exists and diff between last message and current message is less than configured time >> use existing sessionId
 * but update the current timestamp for profileId key.
 *  
 */
exports.isSessionIdExpired = function(profileId){
    let result = false;
    let sessionId = null;
    try{
        let sessionIdAndTimestamp= exports.mapSessionIdGet(profileId);
        logger.log('info', "isSessionIdExpired()> sessionIdAndTimestamp= " + sessionIdAndTimestamp, {logId: profileId});
    
        if(sessionIdAndTimestamp == null){
            result = true;
        }else{
            let sessionId = sessionIdAndTimestamp[0];
            let timestamp = sessionIdAndTimestamp[1];
    
            let difference = new Date().getTime() - timestamp;        
            var minutesDifference = Math.floor(difference/1000/60);
            logger.log('info', "isSessionIdExpired()> minutesDifference= " + minutesDifference, {logId: sessionId});
    
            if(minutesDifference >= SESSION_ID_TIMEOUT_IN_MINUTES){
                result = true;
            } 
        }              
    }catch(e){
        logger.log('error', e.stack, {logId: sessionId});
    }      
    logger.log('info', "isSessionIdExpired()> result= " + result, {logId: sessionId});  
    return result;        
}

/**
 * If session details exists and diff between last message and current message is less than configured time then
 * use existing sessionId but update the current timestamp for profileId key.
 */
exports.updateTimestamp = function(profileId){
    let sessionId = null;
    try{
        let timestamp = new Date().getTime();
        mapSessionId.get(profileId)[1] = timestamp;

        let sessionIdAndTimestamp= exports.mapSessionIdGet(profileId);
        sessionId =sessionId = sessionIdAndTimestamp[0];;
        logger.log('info', "updateTimestamp()> timestamp updated for existing sessionId. sessionIdAndTimestamp= " + sessionIdAndTimestamp, {logId: sessionId});         
    }catch(e){
        logger.log('error', e.stack, {logId: sessionId});
    }        
}

/**
 * Create new session details
 * key is profileId
 * value is array of sessionId and timestamp of last message
 */
exports.mapSessionIdCreate = function(profileId){
    let sessionId = generateSessionId();
    let timestamp = new Date().getTime();
    mapSessionId.set(profileId, []); //create empty array for each profileId
    mapSessionId.get(profileId).push(sessionId); //add sessionId as first parameter in empty array
    mapSessionId.get(profileId).push(timestamp); //add timestamp as second parameter in empty array
    logger.log('info', 'exports.mapSessionIdCreate()>New sessionId= ' + sessionId + ' created. New map size is= ' + mapSessionId.size, {logId: sessionId});  
    return sessionId;     
}

/**
 * Get session details for the profileId
 */
exports.mapSessionIdGet =  function(profileId){     
    return mapSessionId.get(profileId);        
}

/**
 * Delete session details from map
 */
exports.mapSessionIdDelete = function(profileId){
    let result = "Error"
    let sessionId= null;
    try{
        let sessionId= exports.mapSessionIdGet(profileId)[0];

        if(mapSessionId.has(profileId)){
            mapSessionId.delete(profileId);
            result = "Success";
        }else{
            result = "profileId not found";    
        }        
    }catch(e){
        logger.log('error', e.stack, {logId: sessionId});
    }  
    logger.log('info', "mapSessionIdDelete()> result= "+ result + " new map size is= " + mapSessionId.size, {logId: sessionId});
    return result;  
}