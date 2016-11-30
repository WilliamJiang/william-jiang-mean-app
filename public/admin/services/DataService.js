/**
 * Created by PavaniKa on 5/13/2015.
 */

function DataService(mvIdentity,
                     Restangular) {

    //USERS
    var Users = {

        getAllUsers: function () {
            return Restangular
                .all('admin/v1/users')
                .getList();
        },
        getUser: function (userId) {
            return Restangular
                .one('admin/v1/user/' + userId)
                .get();
        },
        createUser: function (user) {
            return Restangular
                .one('admin/v1/user/create')
                .customPOST(user);
        },
        updateUser: function (userId, user) {
            return Restangular
                .one('admin/v1/user/' + userId)
                .customPUT(user);
        },
        setUserInactive: function () {
            return '';
        },
        resetPassword: function (userName, email) {
            return Restangular
                .one('admin/v1/user/reset_password')
                .customPOST({
                    userName: userName,
                    email: email
                });
        }
    };

    //GROUPS
    var Groups = {

        getAllGroups: function () {
            return Restangular
                .all('admin/v1/groups')
                .getList();
        },
        getGroupById: function (gid) {
            return Restangular
                .one('admin/v1/group/' + gid)
                .get();
        },
        createGroup: function (group) {
            return Restangular
                .one('admin/v1/group/create')
                .customPOST(group);
        },
        updateGroup: function (gId, group) {
            return Restangular
                .one('admin/v1/group/' + gId)
                .customPUT(group);
        },
        setGroupInactive: function () {
            return '';
        },
        getNetworks: function(mediaCompanyID) {
            return Restangular
            .all('admin/v1/' + mediaCompanyID + '/networks')
            .getList();
        }
    };

    //MEDIA COMPANIES
    var MediaCompanies = {
        getAllCompanies: function () {
            return Restangular
                .all('admin/v1/companies')
                .getList();
        }
    };

    return {
        Users: Users,
        Groups: Groups,
        MediaCompanies: MediaCompanies
    };
}

angular
    .module('tbadmin')
    .factory('DataService', [
        'mvIdentity',
        'Restangular',
        DataService
    ]);