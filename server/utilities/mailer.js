/* jshint node:true */
'use strict';

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var logger = require('./logger');

var options = {
    auth: {
	api_user: 'knielsen@talentpartners.com',
	api_key: 'trafficbridge1'
    }
}

var transporter = nodemailer.createTransport(sgTransport(options));

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

    var from = 'noreply@trafficbridge.tv';
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

function sendPasswordResetMail(to,text,html,cb) {

    var from = 'noreply@trafficbridge.tv';
    var subject = 'TrafficBridge Password Reset Notification';

    sendMail(from,
        to,
        subject,
        text,
        html,
        cb);
}

function sendWelcomeMail(to,text,html,cb) {

    //var from = 'kenmcc@rsgsystems.com';
    var from = 'noreply@trafficbridge.tv';
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
    sendWelcomeMail: sendWelcomeMail,
    sendPasswordResetMail: sendPasswordResetMail
};
