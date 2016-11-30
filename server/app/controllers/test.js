/* jshint node:true */
'use strict';

var R = require('ramda');
var _ = require('lodash');
var Promise = require('bluebird');
var nodeExcel = require('excel-export');
var importUCRCtrl = require('./importUCR');
var mailer = require('../../utilities/mailer');
var logger = require('../../utilities/logger');

////////////////////////////////////////////////////////////////////////////////

module.exports = function(app) {

    function sendMail(req,res) {

        var from = 'noreply@trafficbridge.tv';
        var to = 'kenmcc@rsgsystems.com';
        var subject = 'TrafficBridge Notification ' + new Date();
        var text = 'Hello world';
        var html = '<b>Hello world</b>';

        mailer.sendMail(from,
                        to,
                        subject,
                        text,
                        html,
                        function(error,info) {

                            if (error) {
                                res.send(error);
                            }
                            else {
                                res.send('Message sent: ' + info.response);
                            }
                        });
    }

    ////////////////////////////////////////////////////////////////////////////////

    function generateExcelDoc(req,res) {

        var conf = {};

        //conf.stylesXmlFile = "styles.xml";

        conf.cols = [
            {
                caption: 'string',
                type: 'string',
                beforeCellWrite: function(row,cellData) {
                    return cellData.toUpperCase();
                },
                width: 28.7109375
            },
            {
                caption: 'date',
                type: 'date',
                beforeCellWrite: function() {

                    var originDate = new Date(Date.UTC(1899,11,30));

                    return function(row, cellData, eOpt){

                        if (eOpt.rowNum%2) {
                            eOpt.styleIndex = 1;
                        }
                        else {
                            eOpt.styleIndex = 2;
                        }
                        if (cellData === null){
                            eOpt.cellType = 'string';
                            return 'N/A';
                        }
                        else {
                            return (cellData - originDate) / (24 * 60 * 60 * 1000);
                        }
                    }
                }()
            },
            {
                caption: 'bool',
                type: 'bool'
            },
            {
                caption: 'number',
                type: 'number'
            }];

        conf.rows = [
            [ 'pi', new Date(Date.UTC(2013, 4, 1)), true, 3.14 ],
            [ "e", new Date(2012, 4, 1), false, 2.7182 ],
            [ "M&M<>'", new Date(Date.UTC(2013, 6, 9)), false, 1.61803 ],
            [ "null date", null, true, 1.414 ]
        ];

        var result = nodeExcel.execute(conf);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
        res.end(result, 'binary');
    }

    function processUCR(req,res) {

        var fn = '/Users/kenmcc/projects/trafficbridge/public/data/sample_ucr.csv';

        importUCRCtrl.processUCR(req.user,fn);
        res.send({ ok: 1 });
    }

    ////////////////////////////////////////////////////////////////////////////////

    return {
        sendMail: sendMail,
        generateExcelDoc: generateExcelDoc,
        processUCR: processUCR
    };
};
