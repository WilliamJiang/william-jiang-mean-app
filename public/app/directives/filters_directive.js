var tbcc = angular.module('app');

/**
 * advertisersList: input-model
 * selectedAdvertisersList: output-model, READONLY
 * selectAdvertiserItem: on-item-click
 * changeAdvertisersItem: on-search-change
 * onClose: on-close
 */
tbcc.directive('advertisersMultiSelect', ["FilterService", "$timeout", function (FilterService, $timeout) {
    "use strict";

    return {
        templateUrl: "advertisers_directive.htm",
        restrict: "EA",
        replace: true,
        scope: false,
        controller: ['$scope', function ($scope) {

            $scope.advertisersList = [];

            // Will list all the selected items, auto updated. This model is OUTPUT ONLY.
            $scope.selectedAdvertisersList = [];

            $scope.getRefreshAdvertisers = function () {

                $scope.advertisersList = FilterService.getAdvertisersList();
                if ($scope.advertisersList.length === 0) {
                    // waiting for loading, try again after 1 second.`
                    $timeout(function () {
                        $scope.$apply(function () {
                            $scope.advertisersList = FilterService.getAdvertisersList();
                        });
                    }, 1000);
                }
                return false;
            };

            $scope.selectAdvertiserItem = function (advertiser) {

                // what is the selected advertiser's brands?
                var brand = [];

                /**
                 * every is better than forEach: breaking a loop.
                 * brand: ["MEDIWINK"]
                 */
                FilterService.getAdvertisersList().every(function (ad, index) {
                    if (ad.name === advertiser.name) {
                        brand = ad.brands;
                        return false;
                    }
                    return true;
                });

                if (advertiser.selected) {

                    /**
                     * brands is different from 6 others, which only set 1 time in $q.all.
                     * brands need to be set and updated every-time when check/un-check 'Advertiser'
                     */
                    FilterService.setBrandsList(brand.map(function (brandObj) {//name) {
                        return {
                            name: angular.filterWord(brandObj.name),
                            value: brandObj.name,
                            selected: false
                        }
                    }));

                    // call existed SelectedFiltersArray function
                    $scope.AddToSelectedFiltersArray('ADVERTISER', {name: advertiser.name, value: advertiser.value});
                }
                else {
                    $scope.brandsList = FilterService.getBrandsList();
                    // remove brands input-modal
                    FilterService.removeBrands.call($scope.brandsList, brand);

                    // if having selected brands, remove from output-modal.
                    FilterService.removeBrands.call($scope.selectedBrandsList, brand);

                    // also remove from $scope.selectedFiltersArray labels.
                    for (var i = 0; i < brand.length; i++) {
                        _.remove($scope.selectedFiltersArray, function (f) {
                            return f.filterType === 'BRAND' && f.filter.value === brand[i];
                        });
                    }
                    _.remove($scope.selectedFiltersArray, function (f) {
                        return f.filterType === 'ADVERTISER' && f.filter.value === advertiser.value;
                    });
                }
                //filter is changed
                $scope.pagination.FILTERS_CHANGED = true;
                $scope.search();
                return false;
            };

            $scope.resetAdvertisers = function () {
                $scope.advertisersList.forEach(function (a) {
                    a.selected = false;
                });
                $scope.selectedAdvertisersList.length = 0;
            };
        }],
        link: function (scope, element) {
            scope.updateAdvertisersList = function (advertiser) {
                scope.selectedAdvertisersList.forEach(function (a, index) {
                    if (a.name === advertiser.name) {
                        scope.selectedAdvertisersList.splice(index, 1);
                    }
                });
            };

            // manually filter the AdvertisersList array.
            scope.filterAdvertisersList = function (query) {
                var list = FilterService.getAdvertisersList();
                var re = new RegExp(query, "gi");

                var matched = list.map(function (li) {
                    return li.advertiser;
                }).filter(function (ad) {
                    return re.test(ad);
                }).map(function (obj) {
                    return {
                        name: obj,
                        selected: true
                    }
                });
                return matched.length ? matched : 'No Matched';
            };
            // 'on-search-change="changeAdvertisersItem(data)"',
            scope.changeAdvertisersItem = function (advertiser) {
                //TPVTB.log('changeAdvertisersItem: ', advertiser);
                return false;
            };
            // 'on-close="onClose"',
            scope.onClose = function () {
                TPVTB.log('Multi Select onClose() called.');
                return false;
            };
        }
    }
}]).run(['$templateCache', function ($templateCache) {

    var advertisers_template = [
        '<div id="ADVERTISER-DROPDOWN">',
        '<div class="filter-title">Advertisers</div>',
        '<div class="dropdown"',
        'william-multi-select',
        'input-model="advertisersList"',
        'output-model="selectedAdvertisersList"',
        'item-label="name"',
        'selection-mode="multiple"',
        'max-labels="0"',
        'helper-elements="FILTER"',
        'tick-property="selected"',
        'on-open="getRefreshAdvertisers()"',
        'on-item-click="selectAdvertiserItem(data)"',
        'max-height="300px"',
        'min-search-length="3"',
        'search-property="name"',
        'default-label="Select Advertiser(s)">',
        '</div>',
        '</div>'
    ].join(' ');

    $templateCache.put('advertisers_directive.htm', advertisers_template);

}]);


/**
 * brandsList:  input-model
 * selectedBrandsList: output-model, READONLY
 * getRefreshBrands: on-open
 * selectBrandsItem: on-item-click
 * changeBrandsItem: on-search-change
 */
tbcc.directive('brandsMultiSelect', ["FilterService", function (FilterService) {
    "use strict";

    return {
        templateUrl: "brands_directive.htm",
        restrict: "EA",
        replace: true,
        scope: false,
        controller: ['$scope', function ($scope) {

            $scope.brandsList = [];
            $scope.selectedBrandsList = [];

            $scope.selectBrandsItem = function (data) {
                //{name, selected}, {name, value}
                var obj = {
                    name: data.name,
                    value: data.value
                };
                if (data.selected) {
                    // update SelectedFiltersArray
                    //FilterService.addToSelectedFiltersArray('BRAND', obj);

                    // call existed SelectedFiltersArray function
                    $scope.AddToSelectedFiltersArray('BRAND', obj);
                }
                else {
                    $scope.RemoveFromSelectedFiltersArray('BRAND', obj);
                }

                //filter is changed
                $scope.pagination.FILTERS_CHANGED = true;
                $scope.search();
                return false;
            };

            $scope.changeBrandsItem = function (data) {
                console.log('changeBrandsItem:', data);
                return false;
            };

            $scope.resetBrands = function () {
                //$scope.brandsList.forEach(function(b) {b.selected = false;});
                FilterService.resetBrandsList();
                $scope.brandsList.length = 0;
                $scope.selectedBrandsList.length = 0;
            };

            //$scope.updateBrandsList = function (brand) {
            //    $scope.selectedBrandsList.forEach(function (b, index) {
            //        if (b.name === brand.name) {
            //            $scope.selectedBrandsList.splice(index, 1);
            //        }
            //    });
            //};
        }],
        link: function (scope, element, attrs, parentCtrl) {

            scope.getRefreshBrands = function () {
                var len = FilterService.getBrandsList().length;
                if (len === 0) {
                    jQuery(event.target)
                        .parent()
                        .find('div.checkboxLayer input')
                        .prop('disabled', 'disabled')
                        .attr('placeholder', 'Please select an Advertiser first.');
                }
                else {
                    jQuery(event.target)
                        .parent()
                        .find('div.checkboxLayer input')
                        .prop("disabled", false)
                        .attr('placeholder', 'Search...');
                    scope.brandsList = FilterService.getBrandsList();
                }
                return false;
            };
        }
    }
}])
    .run(['$templateCache', function ($templateCache) {

        var brands_template = [
            '<div id="BRAND-DROPDOWN">',
            '<div class="filter-title">Brands</div>',
            '<div class="dropdown"',
            'isteven-multi-select',
            'input-model="brandsList"',
            'output-model="selectedBrandsList"',
            'item-label="name"',
            'selection-mode="multiple"',
            'max-labels="0"',
            'helper-elements="FILTER"',
            'tick-property="selected"',
            'on-open="getRefreshBrands()"',
            'on-item-click="selectBrandsItem(data)"',
//            'on-search-change="changeBrandsItem(data)"',
            'max-height="300px"',
            'min-search-length="1"',
            'search-property="name"',
            'default-label="Select Brand(s)">',
            '</div>',
            '</div>'
        ].join(' ');

        $templateCache.put('brands_directive.htm', brands_template);
    }]);


/**
 * programsList: input-model
 * selectedProgramsList: output-model, READONLY
 * getRefreshPrograms:  on-open
 * selectProgramsItem: on-item-click
 * changeProgramsItem: on-search-change
 */
tbcc.directive('programsMultiSelect', ["FilterService", function (FilterService) {
    "use strict";

    return {
        templateUrl: "programs_directive.htm",
        restrict: "EA",
        replace: true,
        scope: false,
        controller: ['$scope', function ($scope) {

            $scope.programsList = [];
            $scope.selectedProgramsList = [];

            $scope.getRefreshPrograms = function () {
                $scope.programsList = FilterService.getProgramsList();
            };

            $scope.selectProgramsItem = function (data) {
                //{name, selected}, {name, value}
                var obj = {
                    name: data.name,
                    value: data.value
                };
                if (data.selected) {
                    // update SelectedFiltersArray
                    //FilterService.addToSelectedFiltersArray('PROGRAM', obj);

                    // call existed SelectedFiltersArray function
                    $scope.AddToSelectedFiltersArray('PROGRAM', obj);
                }
                else {
                    $scope.RemoveFromSelectedFiltersArray('PROGRAM', obj);
                }

                //filter is changed
                $scope.pagination.FILTERS_CHANGED = true;
                $scope.search();
                return false;
            };

            $scope.changeProgramsItem = function (data) {
                console.log('changeProgramsItem: ', data);
                return false;
            };

            $scope.resetPrograms = function () {
                $scope.programsList.forEach(function (p) {
                    p.selected = false;
                });
                $scope.selectedProgramsList.length = 0;

            };
            //$scope.updateProgramsList = function (program) {
            //    $scope.selectedProgramsList.forEach(function (o, index) {
            //        if (o.name === program.name) {
            //            $scope.selectedProgramsList.splice(index, 1);
            //        }
            //    });
            //}
        }],
        link: function (scope, element, attrs, parentCtrl) {
            // console.log(angular.element(element[0]).html());
            angular.noop();
        }
    }
}])
    .run(['$templateCache', function ($templateCache) {

        var programs_template = [
            '<div id="PROGRAM-DROPDOWN">',
            '<div class="filter-title">Programs</div>',
            '<div class="dropdown"',
            'isteven-multi-select',
            'input-model="programsList"',
            'output-model="selectedProgramsList"',
            'item-label="name"',
            'selection-mode="multiple"',
            'max-labels="0"',
            'helper-elements="FILTER"',
            'tick-property="selected"',
            'on-open="getRefreshPrograms()"',
            'on-item-click="selectProgramsItem(data)"',
//            'on-search-change="changeProgramsItem(data)"',
            'max-height="300px"',
            'search-property="name"',
            'default-label="Select Program(s)">',
            '</div>',
            '</div>'
        ].join(' ');

        $templateCache.put('programs_directive.htm', programs_template);
    }]);

tbcc.directive('ownersMultiSelect', ["FilterService", function (FilterService) {
    "use strict";

    return {
        templateUrl: "owners_directive.htm",
        restrict: "EA",
        replace: true,
        scope: false,
        controller: ['$scope', function ($scope) {

            $scope.ownersList = [];
            $scope.selectedOwnersList = [];
            // for tooltip setting.
            $scope.ownerToolTip = true;

            $scope.getRefreshOwners = function () {
                $scope.ownersList = FilterService.getOwnersList();
                return false;
            };

            $scope.selectOwnersItem = function (data) {
                var obj = {
                    name: data.name,
                    value: data.value
                };
                if (data.selected) {

                    //FilterService.addToSelectedFiltersArray('OWNER', obj);
                    // call existed SelectedFiltersArray function
                    $scope.AddToSelectedFiltersArray('OWNER', obj);
                }
                else {
                    $scope.RemoveFromSelectedFiltersArray('OWNER', obj);
                }

                //filter is changed
                $scope.pagination.FILTERS_CHANGED = true;
                $scope.search();
                return false;
            };

            $scope.changeOwnersItem = function (data) {
                console.log('changeOwnersItem: ', data);
                return false;
            };
            $scope.resetOwners = function () {
                $scope.ownersList.forEach(function (o) {
                    o.selected = false;
                });
                $scope.selectedOwnersList.length = 0;
            };

            //$scope.updateOwnersList = function (owner) {
            //    $scope.selectedOwnersList.forEach(function (o, index) {
            //        if (o.value === owner.value) {
            //            $scope.selectedOwnersList.splice(index, 1);
            //        }
            //    });
            //};
        }],
        link: function (scope, element, attrs) {
            angular.noop();
        }
    }
}])
    .run(['$templateCache', function ($templateCache) {

        var owners_template = [
            '<div id="OWNER-DROPDOWN">',
            '<div class="filter-title">Owners</div>',
            '<div class="dropdown"',
            'isteven-multi-select',
            'input-model="ownersList"',
            'output-model="selectedOwnersList"',
            'item-label="name"',
            'selection-mode="multiple"',
            'max-labels="0"',
            'helper-elements="FILTER"',
            'tick-property="selected"',
            'on-open="getRefreshOwners()"',
            'on-item-click="selectOwnersItem(data)"',
            //'on-search-change="changeOwnersItem(data)"',
            'max-height="300px"',
            'search-property="name"',
            'owner-tool-tip="ownerToolTip"',
            'default-label="Select Owner(s)">',
            '</div>',
            '</div>'
        ].join(' ');

        $templateCache.put('owners_directive.htm', owners_template);
    }]);


tbcc.directive('statusMultiSelect', ['FilterService', function (FilterService) {
    "use strict";

    return {
        templateUrl: "status_directive.htm",
        restrict: "EA",
        replace: true,
        scope: false,
        controller: ['$scope', function ($scope) {

            $scope.statusList = [];
            $scope.selectedStatusList = [];

            $scope.getRefreshStatus = function () {
                $scope.statusList = FilterService.getStatusesList();
            };

            $scope.selectStatusItem = function (data) {
                var obj = {
                    name: data.name,
                    value: data.value
                };
                if (data.selected) {
                    //FilterService.addToSelectedFiltersArray('STATUS', obj);

                    $scope.AddToSelectedFiltersArray('STATUS', obj);
                }
                else {
                    $scope.RemoveFromSelectedFiltersArray('STATUS', obj);
                }

                //filter is changed
                $scope.pagination.FILTERS_CHANGED = true;
                $scope.search();
                return false;
            };

            $scope.changeStatusItem = function (data) {
                return false;
            };

            $scope.resetStatus = function () {
                $scope.statusList.forEach(function (s) {
                    s.selected = false;
                });
                $scope.selectedStatusList.length = 0;
            };

            //$scope.updateStatusList = function (status) {
            //    $scope.selectedStatusList.forEach(function (s, index) {
            //        if (s.name === status.name) {
            //            $scope.selectedStatusList.splice(index, 1);
            //        }
            //    });
            //}
        }],
        link: function (scope, element, attrs) {
            angular.noop();
        }
    }
}])
    .run(['$templateCache', function ($templateCache) {

        var status_template = [
            '<div id="STATUS-DROPDOWN">',
            '<div class="filter-title">Status</div>',
            '<div class="dropdown"',
            'isteven-multi-select',
            'input-model="statusList"',
            'output-model="selectedStatusList"',
            'item-label="name"',
            'selection-mode="multiple"',
            'max-labels="0"',
            'helper-elements="FILTER"',
            'tick-property="selected"',
            'on-open="getRefreshStatus()"',
            'on-item-click="selectStatusItem(data)"',
//            'on-search-change="changeStatusItem(data)"',
            'max-height="300px"',
            'search-property="name"',
            'default-label="Select Status">',
            '</div>',
            '</div>'
        ].join(' ');

        $templateCache.put('status_directive.htm', status_template);
    }]);


tbcc.directive('typesMultiSelect', ['FilterService', function (FilterService) {
    "use strict";

    return {
        templateUrl: "types_directive.htm",
        restrict: "EA",
        replace: true,
        scope: false,
        controller: ['$scope', function ($scope) {

            $scope.typesList = [];
            $scope.selectedTypesList = [];

            $scope.getRefreshTypes = function (data) {
                $scope.typesList = FilterService.getTypesList();
                return false;
            };

            $scope.selectTypesItem = function (data) {
                var obj = {
                    name: data.name,
                    value: data.value
                };
                if (data.selected) {

                    //FilterService.addToSelectedFiltersArray('TYPE', obj);

                    $scope.AddToSelectedFiltersArray('TYPE', obj);
                }
                else {
                    $scope.RemoveFromSelectedFiltersArray('TYPE', obj);
                }
                //filter is changed
                $scope.pagination.FILTERS_CHANGED = true;
                $scope.search();
                return false;
            };
            $scope.changeTypesItem = function (data) {
                return false;
            };
            $scope.resetTypes = function () {
                $scope.typesList.forEach(function (t) {
                    t.selected = false;
                });
                $scope.selectedTypesList.length = 0;
            };
        }],
        link: function (scope, element, attrs) {
            angular.noop();
        }
    }
}])
    .run(['$templateCache', function ($templateCache) {

        var types_template = [
            '<div id="TYPE-DROPDOWN">',
            '<div class="filter-title">Types</div>',
            '<div class="dropdown"',
            'isteven-multi-select',
            'input-model="typesList"',
            'output-model="selectedTypesList"',
            'item-label="name"',
            'selection-mode="multiple"',
            'max-labels="0"',
            'helper-elements="FILTER"',
            'tick-property="selected"',
            'on-open="getRefreshTypes()"',
            'on-item-click="selectTypesItem(data)"',
//            'on-search-change="changeTypesItem(data)"',
            'max-height="300px"',
            'search-property="name"',
            'default-label="Select Type(s)">',
            '</div>',
            '</div>'
        ].join(' ');

        $templateCache.put('types_directive.htm', types_template);
    }]);


tbcc.directive('conditionsMultiSelect', ['FilterService', function (FilterService) {
    "use strict";

    return {
        templateUrl: "conditions_directive.htm",
        restrict: "EA",
        replace: true,
        scope: false,
        controller: ['$scope', function ($scope) {

            $scope.conditionsList = [];
            $scope.selectedConditionsList = [];

            $scope.getRefreshConditions = function () {
                $scope.conditionsList = FilterService.getConditionsList();
                return false;
            };

            $scope.selectConditionsItem = function (data) {
                var obj = {
                    name: data.name,
                    value: data.value
                };
                if (data.selected) {
                    $scope.AddToSelectedFiltersArray('CONDITION', obj);
                }
                else {
                    $scope.RemoveFromSelectedFiltersArray('CONDITION', obj);
                }

                //filter is changed
                $scope.pagination.FILTERS_CHANGED = true;
                $scope.search();
                return false;
            };

            $scope.changeConditionsItem = function (data) {
                return false;
            };

            $scope.resetConditions = function () {
                $scope.conditionsList.forEach(function (c) {
                    c.selected = false;
                });
                $scope.selectedConditionsList.length = 0;
            };

            //$scope.updateConditionsList = function (condition) {
            //    $scope.selectedConditionsList.forEach(function (c, index) {
            //        if (c.name === condition.name) {
            //            $scope.selectedConditionsList.splice(index, 1);
            //        }
            //    });
            //}
        }],
        link: function (scope, element, attrs) {
            angular.noop();
        }
    }
}])
    .run(['$templateCache', function ($templateCache) {

        var conditions_template = [
            '<div id="CONDITION-DROPDOWN">',
            '<div class="filter-title">Conditions</div>',
            '<div class="dropdown"',
            'isteven-multi-select',
            'input-model="conditionsList"',
            'output-model="selectedConditionsList"',
            'item-label="name"',
            'selection-mode="multiple"',
            'max-labels="0"',
            'helper-elements="FILTER"',
            'tick-property="selected"',
            'on-open="getRefreshConditions()"',
            'on-item-click="selectConditionsItem(data)"',
//            'on-search-change="changeConditionsItem(data)"',
            'max-height="300px"',
            'search-property="name"',
            'default-label="Select Condition(s)">',
            '</div>',
            '</div>'
        ].join(' ');

        $templateCache.put('conditions_directive.htm', conditions_template);
    }]);


///////////////////////////////////////////////////////////////////////////////////////////////////
//OWNER Dropdown in Now Queue
///////////////////////////////////////////////////////////////////////////////////////////////////
tbcc.directive('ownersNowMultiSelect', ["FilterService", function (FilterService) {
    "use strict";

    return {
        templateUrl: "owners_now_directive.htm",
        restrict: "EA",
        //replace: true,
        scope: false,
        controller: ['$scope', function ($scope) {

            $scope.ownerToolTip = true;
            //this is used in the parent directive for showing the labels
            $scope.translationLAbels = {
                nothingSelected: 'All Owners'
            };

            //console.log('ownersNowMultiSelect controller...');

            $scope.ownersNowList = [];
            $scope.selectedOwnersNowList = [];

            $scope.refreshOwnersNow = function () {
                $scope.ownersNowList = FilterService.getOwnersNowList();
                $scope.selectedOwnersNowList = FilterService.getSelectedOwnerNowList();
                return false;
            };

            $scope.selectOwnersItem = function (data) {
                var obj = {
                    name: data.name,
                    value: data.value
                };
                if (data.selected) {
                    FilterService.addToSelectedOwnersNowList(obj);
                }
                else {
                    FilterService.removeFromSelectedOwnersNowList(obj);
                }

                $scope.reloadQueueCounts();
                return false;
            };

            $scope.changeOwnersItem = function (data) {
                console.log('changeOwnersItem: ', data);
                return false;
            };
            $scope.resetOwners = function () {
                $scope.ownersNowList.forEach(function (o) {
                    o.selected = false;
                });
                $scope.selectedOwnersNowList.length = 0;
            };
        }],
        link: function (scope, element, attrs) {
            //console.log('ownersNowMultiSelect link...');
            //this is to reload any selected owners in the session!
            scope.refreshOwnersNow();

            angular.noop();
        }
    }
}])
    .run(['$templateCache', function ($templateCache) {

        var owners_now_template = [
            '<div class="dropdown owner-now-dropdown"',
            'isteven-multi-select',
            'input-model="ownersNowList"',
            'translation="translationLAbels"',
            'output-model="selectedOwnersNowList"',
            'item-label="name"',
            'selection-mode="multiple"',
            'max-labels="1"',
            'button-label="name"',
            'helper-elements="FILTER"',
            'tick-property="selected"',
            'on-open="refreshOwnersNow()"',
            'on-item-click="selectOwnersItem(data)"',
            //'on-search-change="changeOwnersItem(data)"',
            'max-height="300px"',
            'search-property="name"',
            'owner-tool-tip="ownerToolTip"',
            'default-label="All Owners">',
            '</div>'
        ].join(' ');

        $templateCache.put('owners_now_directive.htm', owners_now_template);
    }]);

///////////////////////////////////////////////////////////////////////////////////////////////////
//Ignored By Dropdown in Now Queue
///////////////////////////////////////////////////////////////////////////////////////////////////
tbcc.directive('ignoredByMultiSelect', ["FilterService", function (FilterService) {
    "use strict";

    return {
        templateUrl: "ignored_by_directive.htm",
        restrict: "EA",
        //replace: true,
        scope: false,
        controller: ['$scope', function ($scope) {

            $scope.ownerToolTip = true;
            //this is used in the parent directive for showing the labels
            $scope.translationLAbels = {
                nothingSelected: 'All Users'
            };

            //console.log('ignoredByMultiSelect controller...');

            $scope.ignoredByList = [];
            $scope.selectedignoredByList = [];

            $scope.refreshIgnoredByList = function () {
                $scope.ignoredByList = FilterService.getIgnoredByUsersList();
                $scope.selectedignoredByList = FilterService.getSelectedIgnoredByUsersList();
                return false;
            };

            $scope.selectIgnoredUserItem = function (data) {
                var obj = {
                    name: data.name,
                    value: data.value
                };
                if (data.selected) {
                    FilterService.addToSelectedIgnoredByUsersList(obj);
                }
                else {
                    FilterService.removeFromSelectedIgnoredByUsersList(obj);
                }

                if($scope.search_ignored) {
                    $scope.pagination.IGNORED_BY_CHANGED = true;
                    $scope.search_ignored();
                }
                return false;
            };

            /*$scope.changeOwnersItem = function (data) {
                console.log('changeOwnersItem: ', data);
                return false;
            };*/
            $scope.resetIgnoredList = function () {
                $scope.ignoredByList.forEach(function (o) {
                    o.selected = false;
                });
                //remove from scope
                $scope.selectedignoredByList.length = 0;
                //reset the previous selections
                FilterService.resetIgnoredByUsers();
            };
        }],
        link: function (scope, element, attrs) {
            //console.log('ignoredByMultiSelect link...');
            //this is to reload any selected owners in the session!
            //scope.refreshIgnoredByList();
            scope.resetIgnoredList();
            angular.noop();
        }
    }
}])
    .run(['$templateCache', function ($templateCache) {

        var ignored_by_template = [
            '<div class="dropdown owner-now-dropdown"',
            'isteven-multi-select',
            'input-model="ignoredByList"',
            'translation="translationLAbels"',
            'output-model="selectedignoredByList"',
            'item-label="name"',
            'selection-mode="multiple"',
            'max-labels="1"',
            'button-label="name"',
            'helper-elements="FILTER"',
            'tick-property="selected"',
            'on-open="refreshIgnoredByList()"',
            'on-item-click="selectIgnoredUserItem(data)"',
            //'on-search-change="changeOwnersItem(data)"',
            'max-height="300px"',
            'search-property="name"',
            'owner-tool-tip="ownerToolTip"',
            'default-label="All Users">',
            '</div>'
        ].join(' ');

        $templateCache.put('ignored_by_directive.htm', ignored_by_template);
    }]);
