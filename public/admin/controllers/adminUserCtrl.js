var tbadmin = angular.module('tbadmin');

function adminUserCtrl($scope,
                       $state,
                       $stateParams,
                       $location,
                       $modalInstance,
                       ADMIN_CONFIG,
                       mvIdentity,
                       DataService,
                       NotifierService,
                       currentUser,
                       companiesList,
                       groupsList) {

    'use strict';

    var USER_ROLES = ADMIN_CONFIG.USER.ROLES;
    var ADMIN_ROLES = ADMIN_CONFIG.USER.ADMIN_ROLES;

    $scope.user = currentUser;
    $scope.bNewUser = $state.current.data.bNewUser;
    /*!! DO NOT CHANGE THIS VALUE !!*/
    $scope.companiesList = companiesList;

    //1. TB Admin - can create users for any company, so enable dropdown
    //2. Super Admin/Admin - can create users only for their company.

    // Companies
    $scope.selectedCompany = $scope.companiesList[0];
    if($scope.bNewUser) {
        //set the affiliation structure
        $scope.user.affiliation.ref_id = $scope.selectedCompany._id;
        $scope.user.affiliation.type = 'media_company'; //both companies are media companies
    } else {
        if ($scope.user.affiliation.ref_id) {
            $scope.selectedCompany = _.find($scope.companiesList, function (_company) {
                return $scope.user.affiliation.ref_id === _company._id;
            });
        }
    }

    // Data Access Groups
    $scope.groupsList = groupsList;
    $scope.selectedGroups = $scope.user.groups || [];

    /*$scope.groupsList.push({_id: '111111', name: 'DAG11111'});
    $scope.groupsList.push({_id: '222222', name: 'DAG22222'});
    $scope.groupsList.push({_id: '333333', name: 'DAG33333'});
    $scope.groupsList.push({_id: '444444', name: 'DAG44444'});
    $scope.groupsList.push({_id: '555555', name: 'DAG55555'});
    $scope.groupsList.push({_id: '666666', name: 'DAG66666'});
    $scope.groupsList.push({_id: '777777', name: 'DAG77777'});
    $scope.groupsList.push({_id: '888888', name: 'DAG88888'});
    $scope.groupsList.push({_id: '999999', name: 'DAG99999'});
    $scope.selectedGroups = ["554277b95db86b06f0344685", "56428dac5db87b06f034469a", "55428dac5db86b06f034468b"]; */

    // Roles
    $scope.rolesList = _.map(USER_ROLES, function (role, key) {
        //console.log(role + ', ' + key);
        return {
            name: key === 'MEDIA_COMPANY' ? 'Copy Coordinator' : 'Traffic Coordinator',
            value: role.USER
        }
    });
    //add an empty item
    $scope.rolesList.splice(0, 0, {
        name: '--Select--',
        value: ''
    });
    $scope.selectedRole = $scope.rolesList[0];
    _.forEach($scope.user.roles, function (_role) {
        if (_role === USER_ROLES.MEDIA_COMPANY.USER) {
            $scope.selectedRole = _.find($scope.rolesList, function (role) {
                return role.value === _role
            });
        } else if (_role === USER_ROLES.AGENCY.USER) {
            $scope.selectedRole = _.find($scope.rolesList, function (role) {
                return role.value === _role
            });
        }
    });

    // Admin Roles
    $scope.adminRolesList = _.map(ADMIN_ROLES, function (role, key) {
        return {
            name: role.name,
            value: role.value
        }
    });
    //add an empty item
    $scope.adminRolesList.splice(0, 0, {
        name: '--Select--',
        value: ''
    });
    $scope.selectedAdminRole = $scope.adminRolesList[0];
    _.forEach($scope.user.roles, function (_role) {
        if (_role === ADMIN_ROLES.TB_ADMIN.value) {
            $scope.selectedAdminRole = _.find($scope.adminRolesList, function (role) {
                return role.value === _role
            });
        } else if (_role === ADMIN_ROLES.SUPER_ADMIN.value) {
            $scope.selectedAdminRole = _.find($scope.adminRolesList, function (role) {
                return role.value === _role
            });
        } else if (_role === ADMIN_ROLES.COMPANY_ADMIN.value) {
            $scope.selectedAdminRole = _.find($scope.adminRolesList, function (role) {
                return role.value === _role
            });
        }
    });

    // Start Date
    $scope.onChangeCompany = function ($event, company) {
        $scope.selectedCompany = company;
        $scope.user.affiliation.ref_id = $scope.selectedCompany._id;
        $scope.user.affiliation.type = 'media_company'; //both companies are media companies
    };
    $scope.onChangeRole = function ($event, role) {
        $scope.selectedRole = role;
        //remove any previous role
        _.remove($scope.user.roles, function(_role){
            return _role === USER_ROLES.MEDIA_COMPANY.USER || _role === USER_ROLES.AGENCY.USER;
        });
        //add the new role
        if(role.value !== '') {
            $scope.user.roles.push(role.value);
        }
    };
    $scope.onChangeGroup = function($event, group) {
        //this is automatically taken care by 'selectedGroups' in the UI.
        $scope.user.groups = $scope.selectedGroups;
    };
    $scope.onChangeAdminRole = function ($event, role) {
        $scope.selectedAdminRole = role;
        //remove any previous admin role
        _.remove($scope.user.roles, function(role){
            return role === ADMIN_ROLES.TB_ADMIN.value || role === ADMIN_ROLES.SUPER_ADMIN.value || role === ADMIN_ROLES.COMPANY_ADMIN.value;
        });
        //add the new admin role
        if(role.value !== '') {
            $scope.user.roles.push(role.value);
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    $scope.saveUser = function () {
        //check if all fields are valid
        if ($scope.userForm.$valid) {
            console.dir($scope.user);

            if ($scope.bNewUser) {
                //create
                DataService
                    .Users
                    .createUser($scope.user)
                    .then(function (_user) {
                        NotifierService.notifySuccess('User created successfully.');
                        $modalInstance.close(_user);
                    })
                    .catch(function (error) {
                        NotifierService.notifyError(error.data.reason);
                    });
            } else {
                //update
                DataService
                    .Users
                    .updateUser($scope.user._id, $scope.user)
                    .then(function (_user) {
                        NotifierService.notifySuccess('User updated successfully.');
                        $modalInstance.close(_user);
                    })
                    .catch(function (error) {
                        NotifierService.notifyError(error.data.reason);
                    });
            }
        } else {
            //validation(s) should be kicked in form field(s) in UI.
        }
    };

    //reset password
    $scope.resetPassword = function() {
        if ($scope.bNewUser) {
            //disabled in UI.
        } else {
            DataService
                .Users
                .resetPassword($scope.user.userName, $scope.user.email)
                .then(function (userId) {
                    NotifierService.notifySuccess('New password sent to ' + $scope.user.userName + ' in an email.');
                })
                .catch(function (error) {
                    NotifierService.notifyError(error.data.reason);
                });
        }
    };
}

angular.module('tbadmin').
    controller('adminUserCtrl', [
        '$scope',
        '$state',
        '$stateParams',
        '$location',
        '$modalInstance',
        'ADMIN_CONFIG',
        'mvIdentity',
        'DataService',
        'NotifierService',
        'currentUser',
        'companiesList',
        'groupsList',
        adminUserCtrl
    ]);