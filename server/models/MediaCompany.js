/* jshint node:true */
'use strict';

var createdModifiedPlugin = require('mongoose-createdmodified').createdModifiedPlugin;
var logger = require('../utilities/logger');

module.exports = function (mongoose, conn) {

    var ObjectId = mongoose.Schema.Types.ObjectId;

    var ProgramSchema = mongoose.Schema({
        name: {
            type: String
        },
        start_date: {
            type: Date
        },
        end_date: {
            type: Date
        }
    });

    ProgramSchema.plugin(createdModifiedPlugin,
        {
            createdName: 'created_at',
            modifiedName: 'updated_at',
            index: true
        });

    var NetworkSchema = mongoose.Schema({
        name: {
            type: String
        },
        call_letters: {
            type: String
        },
        start_date: {
            type: Date
        },
        end_date: {
            type: Date
        },
        programs: [ProgramSchema],
        // william add: for admin purpose.
        status: {
            type: String,
            enum: ['Active', 'Inactive']
        }
    });

    NetworkSchema.plugin(createdModifiedPlugin,
        {
            createdName: 'created_at',
            modifiedName: 'updated_at',
            index: true
        });

    return {
        NetworkSchema: NetworkSchema,
        descriptor: {
            name: {
                type: String
            },
            networks: [NetworkSchema],
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
            },
            config: {
                maxAllowedUnsuccessfulAttempts: {type: Number, default: 5},
                maxDaysPasswordValid: {type: Number, default: 30},
                automatedTimeout: { type: Number, default: 30}
            },
            // william add: for admin purpose.
            termination_date: {
		type: Date
	    },
	    default_ci_type: {
		type: String
	    },
	    default_ci_type_id: {
		type: ObjectId
	    },	    
            status: {
                type: String,
                enum: ['Active', 'Inactive']
            },
	    ucr_processor: {
		type: String // We need an unchanging key to determine what UCR processing code to call
	    }
        },
        extras: function(schema) {
        	schema.methods = {
                    removeConfidentialData: function (){
                    	this.networks = undefined;
                    	this.contact_info = undefined;
                    	this.config = undefined;
                    	this.termination_date = undefined;
                    }
        	}

        }
    };
};
