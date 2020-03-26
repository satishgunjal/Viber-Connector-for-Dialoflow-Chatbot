const express = require('express');
const bodyParser = require('body-parser');
const logger = require("../logger");

const ViberBot = require('viber-bot').Bot;
const BotEvents = require('viber-bot').Events;
const TextMessage = require('viber-bot').Message.Text;
const PictureMessage = require('viber-bot').Message.Picture;

const config = require("../config");
const dialogflow = require("./dialogflow");
let path = require('path')
const fs = require('fs');

// initialize our express app
const app = express();

const webhookUrl = config.viber.webhookUrl;
const botName = config.viber.botName;
const botAvatarLink = config.viber.botAvatarLink;
const viberToken = config.viber.viberToken;

let bot = new ViberBot({
    authToken: viberToken,
    name: botName,
    avatar: botAvatarLink,
    registerToEvents: [
      "subscribed",
      "unsubscribed",
      "conversation_started",
      "message"]
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/viber/webhook', bot.middleware());

async function convertToViberMessage(responses) {
    const replies = [];
    try{
    if (Array.isArray(responses)) {
      await responses.forEach(async (response)=> {
        
        console.log(response.platform)
        if(response.platform=="VIBER"||response.platform=="PLATFORM_UNSPECIFIED"){
          let reply = null;
          if(response.text!=undefined){
            if (response.text.text[0] !== '') {
              reply = new TextMessage(response.text.text[0]);
              }
          }
          else if(response.image!=undefined){
            reply = new PictureMessage(response.image.imageUri);
          }
          else if(response.card!=undefined){
            const buttons = response.card.buttons;
            let viberButtons = [];
            let keyboard = null;
            if (Array.isArray(buttons) && buttons.length > 0) {
            buttons.forEach((button) => {
                if (button.postback.startsWith('http')) {
                viberButtons.push({
                    ActionType: 'open-url',
                    Text: button.text,
                    ActionBody: button.postback
                });
                } else {
                viberButtons.push({
                    ActionType: 'reply',
                    ActionBody: button.postback,
                    Text: button.text,
                });
                }
            });
            keyboard = {
                Type: "keyboard",
                DefaultHeight: true,
                Buttons: viberButtons
            };
            }
            let msgText = '';
            if (response.card.title) {
            msgText = response.card.title;
            }
            if (response.card.subtitle) {
            msgText += ("\n" + response.card.subtitle);
            }
            if (response.card.imageUri) {
            reply = new PictureMessage(response.card.imageUri, msgText, null,
                keyboard);
            } else if (msgText !== '') {
            reply = new TextMessage(msgText, keyboard);
            }
          }
          else if(response.quickReplies!=undefined){
            const replies = response.quickReplies.quickReplies;
                const title = response.quickReplies.title
                    ? response.quickReplies.title : 'Choose an item';
                if (Array.isArray(replies) && replies.length > 0) {
                let keyboard = {
                    Type: "keyboard",
                    DefaultHeight: true,
                    Buttons: []
                };
                replies.forEach((reply) => {
                    keyboard.Buttons.push({
                    ActionType: 'reply',
                    ActionBody: reply,
                    Text: reply,
                    TextSize: 'regular'
                    });
                });
                reply = new TextMessage(title, keyboard);
                }
          }
          else if(response.payload){
            let payload = response.payload.fields.viber.structValue;
                payload = await protoToJson.structProtoToJson(payload);
                reply = bot._messageFactory.createMessageFromJson({message: payload});
                if (payload.keyboard) {
                reply.keyboard = payload.keyboard;
                }
          }
            replies.push(reply);
        }
        
      });
    }
  }
  catch(e){
    logger.log('error',JSON.stringify(e))
  }
    return replies;
  }


  bot.on(BotEvents.MESSAGE_RECEIVED,async (message, response) => {
    logger.log('info','bot.on> event received '); 
    var userProfile = response.userProfile;   
    var userId=userProfile.id;
    let reply=null;
    if(message.text!=undefined){
        var request=message.text;
        logger.log('info', "bot.ont()> I/P> userId= " + userId, {logId: userId}); 
        logger.log('info', "bot.on()> I/P> request= " + request, {logId: userId}); 
        var result=await dialogflow.detectTextIntent(userId,request)
        
        var fulfillment=result.fulfillmentMessages;
        console.log('message() response received');
        console.log(fulfillment)
        reply=await convertToViberMessage(fulfillment)
    }
    else{
        logger.log('info', "bot.ont()> invalid message type");
        reply = new TextMessage('Soory we only accept text input');
    }
    if (reply) {
        bot.sendMessage(userProfile, reply);
    }
    
});

exports.init=function(){
    const http = require('http');
    const port = config.port;
    http.createServer(bot.middleware()).listen(port, () => bot.setWebhook(webhookUrl).then(function(result) {
        logger.log('info','init() '+JSON.stringify(result));
    }).catch(err => {
        logger.log('error','init() error: '+JSON.stringify(err)); 
    }));
}
