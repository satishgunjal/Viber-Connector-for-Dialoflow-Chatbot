# EBL DIA Viber Connector

Viber connector for Dialogflow ChatBot. Follow below steps to create a Dialogflow-Viber connector

* Create a bot account on Viber [link](https://partners.viber.com/account/create-bot-account)
* Viber will generate unique authentication token for your bot account. Copy and store it in secure place, each request posted to Viber by the account will need to contain the token.
* Now create a node.js application which will have dialogflow and viber API integration. Create separate js file for Dialogflow and Viber integrations

## [Dialogflow API Integration](https://cloud.google.com/dialogflow/docs/reference/rest/v2-overview)
- We will use below Dialogflow API moules
  ```
  const dialogflow = require('dialogflow');
  ```
- Every message received through Viber API will be sent to Dialogflow to get the response to send to user
## [Viber API Integration](https://developers.viber.com/docs/api/rest-bot-api/#message-types)
- We will be using below Viber API modules 
  ```
  const ViberBot = require('viber-bot').Bot;
  const BotEvents = require('viber-bot').Events;
  const TextMessage = require('viber-bot').Message.Text;
  const PictureMessage = require('viber-bot').Message.Picture;
  ```
- In order to receive the events from Viber messenger in our node.js connector we need to setup the webhook.
- Once you have your token you will be able to set your account’s webhook. This webhook will be used for receiving callbacks and user messages from Viber.
- Setting the webhook will be done by calling the set_webhook API with a valid & certified URL. This action defines the account’s webhook and the type of events the account wants to be notified about.
- For security reasons only URLs with valid and official SSL certificate from a trusted CA will be allowed. The certificate CA should be on the Sun Java trusted root certificates list.
- This will enable our application to receive the every message that user will type on Viber messenger bot

# How To Test The Application
- Cone the repository to local directory on you PC
- Rename the config-example.js to config.js and replace the config parameters like log path, JSON key values
- To know more about Dialogflow REST API and generating the JSON key please refer [Dialogflow-REST-API-Middleware](https://github.com/satishgunjal/Dialogflow-REST-API-Middleware.git)
- Now run below command to install the dependencies in the local node_modules folder
  ```
  $ npm install
  ```
- Application controller conatins below files
  ```
  - dialogflow.js > contains the integration with Dialogflow REST API. Alos exports the functions which are used by viber.js and test-dialogflow.js
  - viber.js > contains the integration with Viber REST API. Consumes functions from dialogflow.js
  ```

- test folder contains below files
  ```
  - test-index.js > contains code to create express server
  - test-route.js > GET and POST routes configured and mapped with functions in test-dialogflow.js
  - test-dialogflow.js > contains functions which are mapped with GET and POST routes. 'exports.detectTextIntent' function calls function from dialogflow.js
  ```
- Now to test Dialogflow API separatly run below command
  ```
  $ node test\test-index.js   
  ```
 - Application should start without any error, to cross check browse this url : http://localhost:9000/
 - Testing using postman
 
   <img src="images/Dialogflow-API-Testing-Postman.PNG" width="700">
  
    ```
    - Method: POST
    - URL: http://localhost:9000/viberconnector/detectIntent/text
    - Body: {
              "profileId": "profileId", 
              "query": "test",
              "languageCode": "en-US"
            }

     - You should receive the fullfilment response in return
    ```

