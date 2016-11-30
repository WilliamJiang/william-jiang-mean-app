/* jshint node:true */
'use strict';

module.exports = function (mongoose, conn) {

    var ObjectId = mongoose.Schema.Types.ObjectId;

    return {
        descriptor: {
            mediaCompanyID: {
                type: ObjectId
            },
            name: {
                type: 'String',
                required: '{PATH} is required',
                unique: true
            },
            allNetworks: {
                type: Boolean, default: false
            },
            networks: [String],
            network_ids: [ObjectId],
            allAgencies: {
                type: Boolean, default: false
            },
            agencies: [String],
            agency_ids: [ObjectId],
            allUsers: {
                type: Boolean, default: false
            },
            users: [String],
            // william add: for admin purpose.
            termination_date: {
                type: Date
            },
            status: {
                type: String,
                enum: ['Active', 'Inactive'],
                default: 'Active'
            }
        },
        extras: function (schema) {
            schema.methods = {
                isAccessible: function (userName) {
                    return this.users.indexOf(userName) > -1;
                }
            };
        }
    };
};
