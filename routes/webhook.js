const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const apiaiApp = require('apiai')('{ apiaiApp }');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

/* For Facebook Validation */
app.get('/', function (req, res) {
    if (req.query['hub.mode'] && req.query['hub.verify_token'] === '{ use any arbitrary id }') {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.status(403).end();
    }
})


/* Handling all messenges */
app.post('/', (req, res) => {
    console.log(req.body);
    if (req.body.object === 'page') {
        req.body.entry.forEach((entry) => {
            entry.messaging.forEach((event) => {
                if (event.message && event.message.text) {
                    sendMessage(event);
                }
            });
        });
        res.status(200).end();
    }
});

// function sendMessage(event){
//     let sender = event.sender.id;
//     let text = event.message.text;

//      request({
//     url: 'https://graph.facebook.com/v2.9/me/messages',
//     qs: {access_token: '{access_token}'},
//     method: 'POST',
//     json: {
//       recipient: {id: sender},
//       message: {text: text}
//     }
//   }, function (error, response) {
//     if (error) {
//         console.log('Error sending message: ', error);
//     } else if (response.body.error) {
//         console.log('Error: ', response.body.error);
//     }
//   });
// }

function sendMessage(event) {
    let sender = event.sender.id;
    let text = event.message.text;

    let apiai = apiaiApp.textRequest(text, {
        sessionId: '{use any arbitrary id}' // use any arbitrary id
    });

    apiai.on('response', (response) => {
        let aiText = response.result.fulfillment.speech;

        request({
            url: 'https://graph.facebook.com/v2.9/me/messages',
            qs: { access_token: 'access_token' },
            method: 'POST',
            json: {
                recipient: { id: sender },
                message: { text: aiText }
            }
        }, (error, response) => {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    });

    apiai.on('error', (error) => {
        console.log(error);
    });

    apiai.end();
}