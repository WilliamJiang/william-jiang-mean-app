var tbadmin = angular.module('tbadmin');

tbadmin.controller('adminUsersListCtrl',
    ['$scope', '$state', '$stateParams', '$location', 'ADMIN_CONFIG', 'mvIdentity', 'usersList', 'companiesList', 'groupsList',
        function ($scope, $state, $stateParams, $location, ADMIN_CONFIG, mvIdentity, usersList, companiesList, groupsList) {
            'use strict';

            $scope.title = 'User';

            //we can't cache these in UI, there is a high probability in Admin UI
            //that new companies and users are added frequently!
            $scope.usersList = usersList;
            $scope.companies = companiesList;
            $scope.groupsList = groupsList;

            angular.forEach($scope.usersList, function (user) {
                user.getFullName = function () {
                    var _user = this;
                    return _user.firstName + ' ' + _user.lastName;
                };

                user.getCompanyName = function () {
                    var _user = this;
                    var _companyName = '';

                    var _company = _.find($scope.companies, function (company) {
                        if(_user.affiliation) {
                            return company._id === _user.affiliation.ref_id;
                        }
                    });

                    if(_company) {
                        _companyName = _company.name;
                    }

                    return _companyName;
                };

                user.getRoleName = function () {
                    var _user = this;
                    var _userRoles = _user.roles;
                    var _roleName = '';

                    _.forEach(_userRoles, function (role) {
                        if (role === 'media_company.user') {
                            _roleName = 'Copy Coordinator';
                        } else if (role === 'agency.user') {
                            _roleName = 'Traffic Coordinator';
                        }
                    });

                    return _roleName;
                };

                user.getAdminNames = function() {
                    var _user = this;
                    var _userRoles = _user.roles;
                    var _adminArray = [];

                    _.forEach(_userRoles, function (role) {
                        if (role === 'traffic_bridge.admin') {
                            _adminArray.push('TA');
                        } else if (role === 'super.admin') {
                            _adminArray.push('SA');
                        }else if (role === 'company.admin') {
                            _adminArray.push('CA');
                        }
                    });

                   /* _adminArray.push('TA');
                    _adminArray.push('SA');
                    _adminArray.push('CA');*/

                    return _adminArray.length === 0 ? 'N' : _adminArray.join(', ');
                };

                user.getGroupNames = function () {
                    var _user = this;
                    var _userGroups = _user.groups || [];
                    var _groupsArray = [];

                    _.forEach(_userGroups, function (_groupId) {
                        var _group = _.find($scope.groupsList, function (group) {
                            return group._id === _groupId;
                        });
                        if (_group) {
                            _groupsArray.push(_group.name);
                        }
                    });

                    //set this in groupNames so we can show in tooltip!
                    this.groupNames = _groupsArray.join(', ');

                    var _groupVal = '';
                    switch (_groupsArray.length) {
                        case 0:
                            _groupVal = '';
                            break;
                        case 1:
                            _groupVal = _groupsArray[0];
                            break;
                        default:
                            _groupVal = _groupsArray.length + ' Groups';
                            break;
                    }

                    return _groupVal;
                };
            });

            $scope.gridOptions = {
                enableRowSelection: true,
                enableRowHeaderSelection: false,
                enableColumnMenus: false,
                enableFiltering: true, //FILTERING
                data: $scope.usersList,
                columnDefs: [
                    {field: 'getFullName()', displayName: 'Name'},
                    {field: 'userName', displayName: 'Username', cellTooltip: true},
                    {field: 'email', displayName: 'Email', cellTooltip: true},
                    {field: 'getCompanyName()', displayName: 'Company'},
                    {field: 'getRoleName()', displayName: 'Role'},
                    {field: 'getAdminNames()', displayName: 'Admin'},
                    {field: 'getGroupNames()', displayName: 'Groups',
                        cellTooltip: function( row, col ) {
                            //this is set in user.getGroupNames function!
                            return row.entity.groupNames;
                        },
                        cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                            if (row.entity.groups.length > 1) {
                                //this is defined in admin.css
                                return 'multi-group-cell';
                            }
                        }
                    }
                ],
                appScopeProvider: {
                    onDblClick : function(row) {
                        var _entity = row.entity;
                        var userId = _entity._id;

                        //open the user modal
                        $state.go('admin.list_users.editUser', {uid: userId});

                    }
                },
                rowTemplate: "<div ng-dblclick=\"grid.appScope.onDblClick(row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell ></div>"
            };

            $scope.gridOptions.multiSelect = false;
            $scope.gridOptions.modifierKeysToMultiSelect = false;
            $scope.gridOptions.noUnselect = true;
            $scope.gridOptions.onRegisterApi = function( gridApi ) {
                $scope.gridApi = gridApi;
            };

            /**
             * loads the Add/Edit User modal
             */
            $scope.addUser = function () {
                $state.go('admin.list_users.addUser');
            };
            $scope.editUser = function() {

                var selectedRows = $scope.gridApi.selection.getSelectedRows();

                if(selectedRows.length > 0) {
                    var userId = selectedRows[0]._id;
                    $state.go('admin.list_users.editUser', {uid: userId});
                } else {
                    //select a row to edit...
                }
            };
        }]);
