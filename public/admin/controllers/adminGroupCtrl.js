var tbadmin = angular.module('tbadmin');

tbadmin.controller('groupsListCtrl',
    ['$scope', '$state', '$stateParams', 'ADMIN_CONFIG', 'mvIdentity',
        'groupsList', 'companiesList', 'uiGridConstants',
        function ($scope, $state, $stateParams, ADMIN_CONFIG,
                  mvIdentity, groupsList, companiesList, uiGridConstants) {
            'use strict';

            $scope.title = 'Group';
            $scope.groups = groupsList || [];
            $scope.companies = companiesList;

            $scope.addGroup = function () {
                $state.go('admin.list_groups.addGroup');
                return;
            };

            $scope.editGroup = function () {

                var selectedRows = $scope.gridApi.selection.getSelectedRows();

                if (selectedRows.length > 0) {
                    var gId = selectedRows[0]._id;
                    $state.go('admin.list_groups.editGroup', {gid: gId});
                } else {
                    //select a row to edit...
                }
            };

            function diffDays(termination_date) {
                if (!termination_date) {
                    return '';
                }
                var now = new Date();
                var a = moment(now);
                var b = moment(termination_date);
                return a.diff(b, 'days') <= 0 ? 'Active' : 'Inactive';
            }

            function getCompanyName(cid) {
                var _company = _.find($scope.companies, function (company) {
                    return company._id === cid;
                });
                return _company.name;
            }

            $scope.groups.forEach(function (group) {
                group.company = getCompanyName(group.mediaCompanyID);
                group.status = diffDays(group.termination_date);
            });

            $scope.hideGrid = true;

            $scope.pagingOptions = {
                pageSizes: [2, 4, 6],
                pageSize: 2,
                currentPage: 1
            };

            $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
                if (col.filters[0].term) {
                    return 'header-filtered';
                } else {
                    return '';
                }
            };

            //http://brianhann.com/6-ways-to-take-control-of-how-your-ui-grid-data-is-displayed/
            $scope.gridOptions = {
                data: $scope.groups,
                enableRowSelection: true,
                enableRowHeaderSelection: false,
                enableColumnMenus: false,
                enableFiltering: true,
                showColumnFooter: true,
                showGridFooter: true,
                columnDefs: [
                    {field: 'company'},
                    {
                        field: 'name',
                        displayName: 'Group Name',
                        filter: {
                            condition: function (searchTerm, cellValue) {
                                var re = new RegExp(searchTerm, 'i');
                                return re.test(cellValue);
                            }
                        },
                        headerCellClass: $scope.highlightFilteredHeader
                    },
                    {
                        field: 'networks',
                        cellFilter: 'networkFilter',
                        filter: {
                            condition: function (searchTerm, cellValue) {
                                var re = new RegExp(searchTerm, 'i');
                                return re.test(cellValue);
                            }
                        }
                    },
                    {field: 'status'}
                    //{
                    //    field: 'termination_date',
                    //    displayName: 'Termination Date',
                    //    type: 'date',
                    //    cellFilter: 'date: MM/DD/YYYY',
                    //    allowCellFocus: false
                    //},
                    //{
                    //    field: '_id',
                    //    displayName: 'Edit',
                    //    enableCellEdit: false,
                    //    cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">' +
                    //    '<a ui-sref="getGroup({gid: \'{{COL_FIELD}}\'})" class="glyphicon glyphicon-eye-open green"></a></div>'
                    //}
                ],
                appScopeProvider: {
                    onDblClick: function (row) {
                        var _entity = row.entity;
                        var groupId = _entity._id;
                        $state.go('admin.list_groups.editGroup', {gid: groupId});
                    }
                },
                rowTemplate: "<div ng-dblclick=\"grid.appScope.onDblClick(row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell ></div>"

            };

            $scope.gridOptions.multiSelect = false;
            $scope.gridOptions.modifierKeysToMultiSelect = false;
            $scope.gridOptions.noUnselect = true;

            $scope.gridOptions.onRegisterApi = function (gridApi) {
                $scope.gridApi = gridApi;
            };

        }])
    .filter('networkFilter', function () {
        return function (networks) {
            return networks.join(', ');
        }
    });

tbadmin.controller('groupCtrl', [
    '$scope', '$state', '$stateParams', '$modalInstance',
    'ADMIN_CONFIG', 'mvIdentity', 'DataService', 'NotifierService',
    'currentGroup', 'groupsList',
    'companiesList',
    function ($scope, $state, $stateParams, $modalInstance, ADMIN_CONFIG,
              mvIdentity, DataService, NotifierService,
              currentGroup, groupsList, companiesList) {
        'use strict';

        var query = {};
        if ($stateParams && $stateParams.gid) {
            query = {gid: $stateParams.gid};
        }

        $scope.bNewGroup = $state.current.data.bNewGroup;

        $scope.group = currentGroup ? currentGroup : groupsList;

        $scope.companies = companiesList;

        $scope.selectedNetworks = $scope.group.networks || [];

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
            //event.preventDefault();
        };

        // get mediaCompanyID
        var user = mvIdentity.getUser();

        $scope.selectedCompany = _.find($scope.companies, function(company) {
            if(company._id === $scope.group.mediaCompanyID) {
                return company;
            }
        });

        if(! $scope.selectedCompany) {
            $scope.selectedCompany = _.find($scope.companies, function (company) {
                if (company._id === user.affiliation.ref_id) {
                    return company;
                }
            });
        }


        // TB Admin
        if (user.role === ADMIN_CONFIG.USER.ADMIN_ROLES.TB_ADMIN.value) {

            if(!$scope.group.mediaCompanyID) {
                $scope.group.mediaCompanyID = user.affiliation.ref_id;
            }

            DataService
                .Groups
                .getNetworks($scope.group.mediaCompanyID)
                .then(function (_networks) {

                    $scope.networks = _networks;
                })
                .catch(function (error) {

                    console.log(error);
                });

        }
        // Super or Company Admin
        else {

            if(!$scope.group.mediaCompanyID) {
                $scope.group.mediaCompanyID = user.affiliation.ref_id;
            }

            DataService
                .Groups
                .getNetworks($scope.group.mediaCompanyID)
                .then(function (_networks) {

                    $scope.networks = _networks;
                })
                .catch(function (error) {

                    console.log(error);
                });
        }

        $scope.onChangeNetwork = function ($event, network) {
            //this is automatically taken care by 'selectedGroups' in the UI.
            $scope.group.networks = $scope.selectedNetworks;
            
            /////////////////////////////////////////////////////////////////////
            // Save Network IDs
            var networkIndex = -1;
            if(!$scope.group.network_ids){
            	$scope.group.network_ids = [];
            }
            networkIndex = $scope.group.network_ids.indexOf(network._id);
            if(this.checked && networkIndex === -1){
            	$scope.group.network_ids.push(network._id);
            }else if(!this.checked && networkIndex !== -1){
            	$scope.group.network_ids.splice(networkIndex, 1);
            }
            
        };

        $scope.saveGroup = function () {
            //check if all fields are valid
            if ($scope.groupForm.$valid) {

                if ($scope.bNewGroup) {
                    //create
                    DataService
                        .Groups
                        .createGroup($scope.group)
                        .then(function (_group) {

                            NotifierService.notifySuccess('Group created successfully.');
                            $modalInstance.close(_group);
                        })
                        .catch(function (error) {

                            NotifierService.notifyError(error.data.reason);
                        })
                        .finally(function () {
                            $state.go('admin.list_groups', null, {reload: true});
                        });
                } else {
                    //update
                    DataService
                        .Groups
                        .updateGroup($scope.group._id, $scope.group)
                        .then(function (_group) {

                            NotifierService.notifySuccess('Group updated successfully.');
                            $modalInstance.close(_group);
                        })
                        .catch(function (error) {

                            NotifierService.notifyError(error.toString());
                        });
                }
            } else {
                //validation(s) should be kicked in form field(s) in UI.
            }
        };

        $scope.checkAll = function () {
        	$scope.group.network_ids = [];
        	
            $scope.networks.forEach(function (n) {
                $scope.selectedNetworks.push(n.name);

                // Save Network IDs
                $scope.group.network_ids.push(n._id);
            });
            $scope.group.networks = $scope.selectedNetworks;

        };

        $scope.unCheckAll = function () {

            $scope.selectedNetworks = [];
            $scope.group.networks = $scope.selectedNetworks;
            
            /////////////////////////////////////////////////////////////////////
            // Save Network IDs
            $scope.group.network_ids = [];
        }

        $scope.onChangeCompany = function ($event, company) {
            $scope.selectedCompany = company;
            DataService
                .Groups
                .getNetworks($scope.selectedCompany._id)
                .then(function (_networks) {

                    $scope.networks = _networks;
                    $scope.group.mediaCompanyID = $scope.selectedCompany._id;
                })
                .catch(function (error) {

                    console.log(error);
                });
        };

    }]);