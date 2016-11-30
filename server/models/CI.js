/* jshint node:true */
'use strict';

var _ = require('lodash');
var _CI = require('../constants').CI;
var misc = require('../utilities/misc');
var logger = require('../utilities/logger');

module.exports = function (mongoose,conn) {

    var IngestSchemaDescriptor = require('./Ingest')(mongoose,conn).descriptor;

    var ObjectId = mongoose.Schema.Types.ObjectId;

    return {
        history: true,
        descriptor: {
            ingest: IngestSchemaDescriptor,
            owner: {
                type: String
            },
            owner_id: {
                type: ObjectId
            },
            notMeOptionChecked: {
                type: Boolean
            },
	    media_company_id: {
		type: ObjectId
	    },
            network: {
                type: String
            },
            network_id: {
                type: ObjectId
            },
            advertiser: {
                type: String
            },
            advertiser_id: {
                type: ObjectId
            },
            brand: {
                type: String
            },
            brand_id: {
                type: ObjectId
            },
            program: {
                type: String
            },
            program_id: {
                type: ObjectId
            },
            type: {
                type: String
            },
            type_id: {
                type: ObjectId
            },
            air_date_start: {
                type: Date
            },
            air_date_end: {
                type: Date
            },
            status: {
                type: String,
                "enum": _.values(_CI.STATUS)
            },
            previous_status: {
                type: String,
                "enum": _.values(_CI.STATUS)
            },
            ignored_by_id: {
                type: ObjectId
            },
            ignored_at: {
                type: Date
            },
            staple: [
                {
                    ci_id: Object,
                    created_at: Date
                }
            ],
            stapled_to: {
                type: ObjectId
            },
            reason_for_not_staple: {
                type: String
            },
            reason_to_unstaple: {
                type: String
            },
            note: {
                type: String
            },
            active: {
                type: Boolean,
                default: true
            },
            rotation: {
                type: Number,       // 0, 90, 180, 270
                default: 0
            },
            ignore_reason: {
                type: String
            },
            possibly_revised: {
                type: Boolean,
                default: false
            },
            possible_revision: {
                type: Boolean,
                default: false
            },
            pending_revision: {
                type: Boolean,
                default: false
            },
            uninstructed_match: {
                type: Boolean,
                default: false
            },
            stuck: {
                type: Boolean,
                default: false
            },
            notReviewed:{
                type: Boolean,
                default: false
            },
            markedAsApplied:{
                type: Boolean,
                default: false
            },
            has_new_messages: {
                type: Boolean,
                default: false
            },
            filed_at: {
                type: Date
            },
            filed_by: {
                type: String
            },
            filed_by_id: {
                type: ObjectId
            },
            saved_at: {
                type: Date
            },
            saved_by_id: {
                type: ObjectId
            },
            created_by: {
                type: String //ObjectId
            },
            updatedUser: {
                type: String
            },
            updated_by_id: {
                type: ObjectId
            },
            archived: {}
        },
        options: {
            toObject: {
                virtuals: true
            },
            toJSON: {
                virtuals: true
            }
        },
        virtuals: {
            advertiserSlot: function () {

                if (this.filed_at) {
                    return this.advertiser;
                }

                return this.advertiser || this.ingest.metadata.advertiser || this.ingest.sender;
            },
            brandSlot: function () {

                // If the advertiser was extracted, but brand wasn't don't show the subject with it, which looks odd
                // This occurs with OX NT:TCABLE for example

                if (this.filed_at || this.saved_at) {
                    return this.brand;
                }

                return this.brand ||
                    this.ingest.metadata.brand ||
                    ((this.advertiser || this.ingest.metadata.advertiser) ? '---' : this.ingest.subject);
            },
            programSlot: function () {

                if (this.filed_at || this.saved_at) {
                    return this.program;
                }

                return this.program || this.ingest.metadata.program;
            },
            airDateStartSlot: function () {

                if (this.filed_at) {
                    return this.air_date_start;
                }

                return this.air_date_start || this.ingest.metadata.air_date_start;
            },
            airDateEndSlot: function () {

                if (this.filed_at) {
                    return this.air_date_end;
                }

                return this.air_date_end || this.ingest.metadata.air_date_end;
            },
            typeSlot: function () {

                if (this.filed_at) {
                    return misc.nameFromKey(this.type);
                }

                return misc.nameFromKey(this.type) || misc.nameFromKey(this.ingest.metadata.type);
            }
        }
    };
};
