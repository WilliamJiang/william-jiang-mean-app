/* jshint node:true */
'use strict';

var nodemailer = require('nodemailer');
var sesTransport = require('nodemailer-ses-transport');
var logger = require('./logger');

var options = {
    accessKeyId: 'AKIAITWWFTUXOZLWSK2A',
    secretAccessKey: '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',
    rateLimit: 1 // do not send more than 1 message in a second
};

var transporter = nodemailer.createTransport(sesTransport(options));

function sendMail(from,to,subject,text,html,cb) {

    /*
      var mailOptions = {
      from: 'kenmcc@rsgsystems.com',
      //to: 'kenmcc@rsgsystems.com', // list of receivers
      to: 'ken.mccloskey@gmail.com', // list of receivers
      subject: 'Hello ✔', // Subject line
      text: 'Hello world ✔', // plaintext body
      html: '<b>Hello world ✔</b>' // html body
      };
    */

    var mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: text,
        html: html
    };

    logger.debug(mailOptions);

    transporter.sendMail(mailOptions,cb);
}

function sendNotificationMail(to,text,html,cb) {

    var from = 'kenmcc@rsgsystems.com';
    //var from = 'ken.mccloskey@gmail.com';    
    var subject = 'TrafficBridge Notification';

    sendMail(from,
             to,
             subject,
             text,
             html,
             cb);
    /*
      function(error,info) {

      if (error) {
      res.send(error);
      }
      else {
      res.send('Message sent: ' + info.response);
      }
      });
    */
}

function sendWelcomeMail(to,text,html,cb) {

    //var from = 'kenmcc@rsgsystems.com';
    var from = 'ken.mcccloskey@gmail.com';
    var subject = 'Welcome to TrafficBridge!';

    sendMail(from,
             to,
             subject,
             text,
             html,
             cb);
}

module.exports = {
    sendMail: sendMail,
    sendNotificationMail: sendNotificationMail,
    sendWelcomeMail: sendWelcomeMail
};
