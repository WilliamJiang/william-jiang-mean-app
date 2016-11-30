/* jshint node:true */
/**
 * william modified: type: 'String' to String, required true/false
 */
module.exports = function (mongoose,conn) {
    
    'use strict';
    var ObjectId = mongoose.Schema.Types.ObjectId;
    
    return {
        history: true,
        descriptor: {
        	isAnnotationData:{
        		type: Boolean, default: true 
        	},
            id: {
                type: String,
                required: true,
                unique: true
            },
            annotationId: {
                type: String,
                required: true,
                unique: true
            },
            ciId: {
                type: String,
                required: true
            },
            network: {
                type: String
            },
            category: {type: String},
        	reviewed:{
        		type: Boolean, default: false 
        	},
            customFields: {
                markedUser: {type: String},
                markedDate: {type: Date},
                markedAsReviewedBeforeEndDate:{
            		type: Boolean, default: false 
            	},
            	markedAsEndDated:{
            		type: Boolean, default: false 
            	},
            	markedAsReviewedAfterEndDate:{
            		type: Boolean, default: false 
            	}
            },
            customData: [{
                key: {type: String},
                value: {type: String}
            }],
            page: {
                type: String,
                required: true
            },
            quote: {type: String},
            tags: [{type: String}],
            text: {type: String},
            uri: {type: String},
            user: {type: String},
            permissions: {
                read: [{type: String}],
                update: [{type: String}],
                delete: [{type: String}],
                admin: [{type: String}]
            },
            ranges: [{
                start: {type: String},
                startOffset: {type: String},
                end: {type: String},
                endOffset: {type: String}
            }],
            /*Attributes of Image annotations*/
            shapes: [{
                type: {type: String},
                geometry: {x: Number, width: Number, y: Number, height: Number}
            }],
            src: {type: String},
            createdUser: {type: String},// Display Name
            updatedUser: {type: String},// Display Name
            createdUserID: {type: ObjectId},
            updatedUserID: {type: ObjectId},
            /* These are for the Audit Trail purposes*/
            createdDate: {type: Date},
            updatedDate: {type: Date},
            deletedDate: {type: Date},
            recordStatus: {type: Number} //0 means active, 1 means deleted
        }
    };
};
