var COMPANY = {
    TYPE: {
        AGENCY: 'agency',
        MEDIA_COMPANY: 'media_company'
    }
};

var INGEST = {
    METHOD: {
        MANUAL: 'manual',
        EMAIL: 'email',
        SYSTEM: 'system'
    },
    SOURCE: {
        TRAFFICBRIDGE: 'bridge',
        AGENCY: 'agency'
    },
    DOC_TYPE: {
        OX: 'ox',
        DS: 'ds',
        UNKNOWN: 'unknown'
    },
    STATUS: {
	IN_PROGRESS: 'in_progress',
	SUCCESS: 'success',
	PARTIAL_SUCCESS: 'partial_success',
	ERROR: 'error',
	PARTIAL_ERROR: 'partial_error',
	NO_CI: 'no_ci'
    }
};

var CI = {
    STATUS: {
        DELIVERED: 'delivered',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        IGNORED: 'ignored',
        EMAILS: 'emails',
        UNSTAPLED: 'unstapled' //this is used for the CIs which are unstapled.
    },
    TYPE: {

        /*
         BB-BILLBOARD
         DRFI-DIRECT RESPONSE FILLER
         DRPR-DIRECT RESPONSE PRIORITY
         NATL-NATIONAL
         PP-PAID PROGRAM
         TAGGED-PTAGGED PROMO
         VIG-NVIGNETTE
         */

        BILLBOARD: 'BB', //'billboard',
        DIRECT_RESPONSE_FILLER: 'DRFI', //'direct_response_filler',
        DIRECT_RESPONSE_PRIORITY: 'DBPR', //'direct_response_priority',
        NATIONAL: 'NATL', //national',
        PAID_PROGRAM: 'PP', //paid_program',
        PROMO: 'TAGGED-P', //'promo',
        VIGNETTE: 'VIG-N' //'vignette'

        /*
         NATIONAL: 'national',
         DIRECT_RESPONSE: 'direct_response',
         PAID_PROGRAMMING: 'paid_programming',
         BARTER: 'barter'
         */
    },
    CONDITION: {
        REVISION: 'revision',
        STUCK: 'stuck',
        MATCH: 'match',
        NEEDS_REVIEW: 'needs_review'
    },
    STAPLE_NOTES: {
        DUPLICATE: 'Stapled as a duplicate.',
        ATTACHMENT: 'Stapled as an attachment.'
    }
};

var USER = {
    ROLES: {
        MEDIA_COMPANY: {
            ADMIN: 'media_company.admin',
            SUPERVISOR: 'media_company.supervisor',
            USER: 'media_company.user'
        },
        AGENCY: {
            ADMIN: 'agency.admin',
            SUPERVISOR: 'agency.supervisor',
            USER: 'agency.user'
        }
    },
    ADMIN_ROLES: {
        TB_ADMIN: {
            name: 'TrafficBridge Admin',
            value: 'traffic_bridge.admin'
        },
        SUPER_ADMIN: {
            name: 'Super Admin',
            value: 'super.admin'
        },
        COMPANY_ADMIN: {
            name: 'Company Admin',
            value: 'company.admin'
        }
    }
};

var QUEUE = {
    NEW: 'new',
    NOW: 'now',
    REVISION: 'revision',
    STUCK: 'stuck',
    UNINSTRUCTED: 'uninstructed',
    LIBRARY: 'library',
    PARKING_LOT: 'parking_lot',
    EMAILS: 'emails'
};

var UCR = {
    STATUS: {
        IN_PROGRESS: 'in_progress',
        PARTIAL_SUCCESS: 'partial_success',
        SUCCESS: 'success',
        FATAL_ERROR: 'fatal_error'
    }
};

var AUTH = {
    MSG: {
        USR_PWD_INVALID: "Sorry, your password or user name is incorrect.",
        USR_UNAUTHORIZED: "User unauthorized to access the system.",
        USR_ACC_LOCKED: "Oops! Your account is locked. Contact your administrator to reset your account."
    },
    SESSION_TIME: 30 //minutes.
}

module.exports = {
    COMPANY: COMPANY,
    INGEST: INGEST,
    CI: CI,
    USER: USER,
    UCR: UCR,
    QUEUE: QUEUE,
    AUTH: AUTH
};
