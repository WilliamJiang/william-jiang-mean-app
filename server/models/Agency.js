/* jshint node:true */
'use strict';

var logger = require('../utilities/logger');

module.exports = function (mongoose,conn) {

    return {
        descriptor: {
            name: {
                type: String
            },
            type: {
                type: String
            },
            start_date: {
                type: Date
            },
            end_date: {
                type: Date
            },
            contact_info: {
                first_name: {
                    type: String
                },
                last_name: {
                    type: String
                },
                email: {
                    type: String
                },
                phone: {
                    type: String
                }
            }
        }
    };
};
