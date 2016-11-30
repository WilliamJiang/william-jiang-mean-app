var COMPANY = {
    TYPE: {
        AGENCY: 'agency',
        MEDIA_COMPANY: 'media_company'
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

//william:
var _STATUS = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive'
};
var PERM_TB_ADMIN = {
    company: [1, 1, 1, 1], //list, add, edit, inactive
    DAG: [1, 0, 0, 0],
    user: [1, 1, 1, 1],
    network: [1, 0, 0, 0],
    advertiser: [1, 0, 0, 0],
    type: [1, 0, 0, 0],
    brand: [1, 0, 0, 0],
    title: [1, 0, 0, 0]
};
var PERM_SUPER_ADMIN = {
    company: [0, 0, 0, 0], //list, add, edit, inactive
    DAG: [1, 0, 0, 0],
    user: [1, 1, 1, 1],
    network: [1, 1, 1, 1],
    advertiser: [1, 1, 1, 1],
    type: [1, 1, 1, 1],
    brand: [1, 1, 1, 1],
    title: [1, 1, 1, 1]
};
var PERM_COMPANY_ADMIN = {
    company: [0, 0, 0, 0], //list, add, edit, inactive
    DAG: [1, 0, 0, 0],
    user: [1, 1, 1, 1],
    network: [1, 1, 1, 1],
    advertiser: [1, 1, 1, 1],
    type: [1, 1, 1, 1],
    brand: [1, 1, 1, 1],
    title: [1, 1, 1, 1]
};

module.exports = {
    COMPANY: COMPANY,
    USER: USER,
    STATUS: _STATUS,
    TD_ADMIN: PERM_TB_ADMIN,
    SUPER_ADMIN: PERM_SUPER_ADMIN,
    COMPANY_ADMIN: PERM_COMPANY_ADMIN
};
