/* jshint node:true */
'use strict';

var constants = require('../constants');
var _COMPANY = constants.COMPANY;
var logger = require('../utilities/logger');

module.exports = function(mongoose,conn) {

    var ObjectId = mongoose.Schema.Types.ObjectId;    

    return {
        descriptor: {
            firstName: {
                type: 'String',
                required: '{PATH} is required'
            },
            lastName: {
                type: 'String',
                required: '{PATH} is required'
            },
            userName: {
                type: 'String',
                required: '{PATH} is required',
                unique: true
            },
            email: {
                type: 'String'
            },
        	unsuccessfulLoginAttempts:{
        		type: Number, default: 0 
        	},
            salt: {
                type: 'String',
                required: '{PATH} is required'
            },
            hashed_pwd: {
                type: 'String',
                required: '{PATH} is required'
            },
            passwordUpdatedDate:{type: Date, default: new Date()},
            affiliation: {
                type: {
                    type: 'String'
                },
                ref_id: {
                    type: ObjectId
                },
                metadata: {
                }
            },
            roles: [ String ],
            groups: [ String ], //data access groups
            start_date: {
                type: Date
            },
            end_date: {
                type: Date
            },
            comment: {
                type: 'String'
            }
        },
        extras: function(schema) {

            //var Agency = conn.model('Agency');
            //var MediaCompany = conn.model('MediaCompany');
	    //logger.debug(Agency,'Agency');
	    //logger.debug(MediaCompany,'MediaCompany');
	    
            var encrypt = require('../utilities/encryption');

            schema.virtual('affiliation.$company').set(function(company) {
                this.affiliation.company = company;
            });

            schema.methods = {
                isValidLoginAttempt: function (maxAllowedUnsuccessfulLoginAttempts) {
                	
                    return this.unsuccessfulLoginAttempts < maxAllowedUnsuccessfulLoginAttempts;
                },
                ageOfPassword: function () {
                	
              	  	var date = new Date(), 
              	  		created = Date.UTC(this.passwordUpdatedDate.getFullYear(), this.passwordUpdatedDate.getMonth(), this.passwordUpdatedDate.getDate()),
              	  		today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
           	
                    return Math.floor((today - created) / (1000 * 60 * 60 * 24));
                },
                isPasswordExpired: function (maxDaysPasswordValid) {
                	
                    return this.ageOfPassword() > maxDaysPasswordValid;
                },
                isTerminated: function () {
                	if(this.end_date){
                		var date = new Date();
                		return date > this.end_date;
                	}else{
                		return false;
                	}

                },
                noOfDaysPasswordValid: function (maxDaysPasswordValid) {
                	
                    return  maxDaysPasswordValid - this.ageOfPassword();
                },
                removeConfidentialData: function (){
                	this.unsuccessfulLoginAttempts = 0;
                	this.salt = undefined;
                	this.hashed_pwd = undefined;
                	this.passwordUpdatedDate = undefined;
                	this.end_date = undefined;
                },
                authenticate: function (passwordToMatch) {

                    return encrypt.HashPasword(this.salt,passwordToMatch) === this.hashed_pwd;
                },
                hasRole: function (role) {

                    return this.roles.indexOf(role) > -1;
                },
                getCompany: function() {

		    var _Agency = conn.model('Agency');
		    var _MediaCompany = conn.model('MediaCompany');
		    
		    logger.debug(this.affiliation.type,'this.affiliation.type');

                    if (this.affiliation.type === _COMPANY.TYPE.AGENCY) {

                        return _Agency
                            .findOne({ _id: this.affiliation.ref_id })
                            .execAsync();
                    }
                    else if (this.affiliation.type === _COMPANY.TYPE.MEDIA_COMPANY) {

			logger.debug(this.affiliation.type,'0this.affiliation.type');
			logger.debug(this.affiliation.ref_id,'0this.affiliation.ref_id');			

                        return _MediaCompany
                            .findOneAsync({ _id: this.affiliation.ref_id });
                            //.execAsync();
                    }
                }
            };
        }
    };
};
