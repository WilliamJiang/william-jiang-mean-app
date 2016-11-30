function TrafficCoordinatorLibraryCtrl($rootScope,
                                    $scope,
                                    $location,
                                    mvIdentity,
                                    DataService,
                                    //_advertisers,
                                    APP_CONFIG) {

    $rootScope.returnTo = '/tc/home/library';

    ////////////////////////////////////////
    // This should be resolved prior in route (and cached!)... kenmc

    var idx = 0;

    /*
    DataService
        .MediaCompanies
        .getAdvertisers(mvIdentity.currentUser.affiliation.ref_id)
        .then(function(advertisers) {

	    advertisers = _.take(advertisers,10);

            var brands = _.flatten(_.map(advertisers,function(advertiser) {
                return advertiser.brands;
            }));

            $scope.advertisers = [];

            _.forEach(advertisers,function(advertiser) {
                $scope.advertisers.push({ name: advertiser.advertiser, value: idx++ });
            });

            $scope.brands = [];

            var idx1 = 0;

            _.forEach(brands,function(brand) {
                $scope.brands.push({ name: brand, value: idx++ });
            });
        })
	.then(function() {

	    DataService
		.MediaCompanies
		.getProgramsForNetwork(mvIdentity.currentUser.affiliation.ref_id,
				       mvIdentity.currentUser.affiliation.metadata.active_network)
		.then(function(programs) {

		    $scope.programs = [];

		    _.forEach(programs,function(program) {
			$scope.programs.push({ name: program.name.toUpperCase(), value: idx++ });
		    });
		});
	});
    */

    //////////////////////
    //START: Filters //
    //////////////////////

    ////////////////////////////////////////
    //AIR DATES
    //TODO:
    $scope.selectedAirDates = [];
    $scope.onChangeAirDates = function () {

        //TODO:search();
    }

    ////////////////////////////////////////
    //ADVERTISERS
    $scope.advertisers = [];
    $scope.selectedAdvertisers = [];
    $scope.onChangeAdvertiser = function ($event, advertiser) {
        if ($event.target.type === 'checkbox' && $event.target.checked) {
            //console.log(type);
            $scope.selectedAdvertisers.push(advertiser);
            AddToSelectedFiltersArray('ADVERTISER', advertiser);
        } else {
            //remove from scope
            _.pull($scope.selectedAdvertisers, advertiser);
            //remove from selected filters array for UI
            RemoveFromSelectedFiltersArray('ADVERTISER', advertiser);
        }

        //TODO:search();
    }

    ////////////////////////////////////////
    //BRANDS
    $scope.brands = [];
    $scope.selectedBrands = [];
    $scope.onChangeBrand = function ($event, brand) {
        if ($event.target.type === 'checkbox' && $event.target.checked) {
            //console.log(type);
            $scope.selectedBrands.push(brand);
            AddToSelectedFiltersArray('BRAND', brand);
        } else {
            //remove from scope
            _.pull($scope.selectedBrands, brand);
            //remove from selected filters array for UI
            RemoveFromSelectedFiltersArray('BRAND', brand);
        }

        //TODO:search();
    }

    ////////////////////////////////////////
    //PROGRAMS
    $scope.programs = [];
    $scope.selectedPrograms = [];
    $scope.onChangeProgram = function ($event, program) {
        if ($event.target.type === 'checkbox' && $event.target.checked) {
            //console.log(type);
            $scope.selectedPrograms.push(program);
            AddToSelectedFiltersArray('PROGRAM', program);
        } else {
            //remove from scope
            _.pull($scope.selectedPrograms, program);
            //remove from selected filters array for UI
            RemoveFromSelectedFiltersArray('PROGRAM', program);
        }

        //TODO:search();
    }

    ////////////////////////////////////////
    //STATUS
    $scope.statuses = DataService.CI.getStatusesForSelectInLibrary();
    $scope.selectedStatuses = [];
    $scope.onChangeStatus = function ($event, status) {
        if ($event.target.type === 'checkbox' && $event.target.checked) {
            //console.log(type);
            $scope.selectedStatuses.push(status);
            AddToSelectedFiltersArray('STATUS', status);
        } else {
            //remove from scope
            _.pull($scope.selectedStatuses, status);
            //remove from selected filters array for UI
            RemoveFromSelectedFiltersArray('STATUS', status);
        }

        search();
    }

    ////////////////////////////////////////
    //TYPE
    $scope.types = DataService.CI.getTypesForSelect(mvIdentity.currentUser.affiliation.ref_id);
    $scope.selectedTypes = [];
    $scope.onChangeType = function ($event, type) {
        if ($event.target.type === 'checkbox' && $event.target.checked) {
            /*if(type.value === APP_CONFIG.CI.TYPE.ALL){
            //empty the types array
            $scope.selectedTypes = [];
            RemoveAllFromSelectedFiltersArray('TYPE', type);
            } else {
            //add to scope
            $scope.selectedTypes.push(type);
            //update selected filters array for UI
            AddToSelectedFiltersArray('TYPE', type);
            }*/
            $scope.selectedTypes.push(type);
            //update selected filters array for UI
            AddToSelectedFiltersArray('TYPE', type);
        } else {
            //remove from scope
            _.pull($scope.selectedTypes, type);
            //remove from selected filters array for UI
            RemoveFromSelectedFiltersArray('TYPE', type);
        }

        search();
    }

    ////////////////////////////////////////
    //CONDITION
    $scope.conditions = DataService.CI.getConditionsForSelect();
    $scope.selectedConditions = [];
    $scope.onChangeCondition = function ($event, condition) {
        if ($event.target.type === 'checkbox' && $event.target.checked) {
            //add to scope
            $scope.selectedConditions.push(condition);
            //update selected filters array for UI
            AddToSelectedFiltersArray('CONDITION', condition);
        } else {
            //remove from scope
            _.pull($scope.selectedConditions, condition);
            //remove from selected filters array for UI
            RemoveFromSelectedFiltersArray('CONDITION', condition);
        }

        search();
    }

    ////////////////////////////////////////
    //SORT BY
    $scope.sortBy = [
        {name: 'Most Recent', value: 0},
        {name: 'Air Date', value: 1},
        {name: 'Advertiser', value: 2},
        {name: 'Brand', value: 3},
        {name: 'Program', value: 4},
        {name: 'Status', value: 5},
        {name: 'Type', value: 6}
    ];
    $scope.selectedSortBy = $scope.sortBy[0];
    $scope.orderBypredicate = '';
    setSortOrder();

    $scope.onChangeSortBy = function ($event, sortOption) {
        $scope.selectedSortBy = sortOption;
        setSortOrder();
    }

    /**
     * This is used to determine the sort order
     * based on the "Sort By" selection.
     */
    function setSortOrder() {
        switch ($scope.selectedSortBy.name) {
        case 'Most Recent':
            $scope.orderBypredicate = '-updated_at';
            break;
        case 'Air Date':
            $scope.orderBypredicate = '-air_date_start';
            break;
        case 'Advertiser':
            $scope.orderBypredicate = 'advertiser';
            break;
        case 'Brand':
            $scope.orderBypredicate = 'brand';
            break;
        case 'Program':
            $scope.orderBypredicate = 'program';
            break;
        case 'Status':
            $scope.orderBypredicate = 'status';
            break;
        case 'Type':
            $scope.orderBypredicate = 'type';
            break;
        }
    }

    $scope.selectedFiltersArray = [];

    $scope.CLEAR_ALL_FILTERS = false;

    //This is to clear all the selected filters
    $scope.ClearAllFilters = function ($event) {
        //clear selected filters array
        $scope.selectedFiltersArray = [];

        //Clear individual filter arrays
        Clear_All_Filters();
        //clear all dropdown selections
        Clear_DropDown_Selections();
        //update search results
        search();
    }
    //This is to clear a particular search filter
    $scope.ClearSelectedFilter = function ($event, filterItem) {
        //remove from selected filters array
        _.pull($scope.selectedFiltersArray, filterItem);
        //also remove from the corresponding filter arrays
        RemoveFromFilterByType(filterItem.filterType, filterItem.filter);
        //clear corresponding dropdown selection
        Update_DropDown_Selections(filterItem.filterType, filterItem.filter.value);
        //update the search results
        search();
    }

    //This is to add a new filter item to the selected filters array
    function AddToSelectedFiltersArray(filterType, filter) {
        //if all is selected clear the array
        $scope.selectedFiltersArray.push({
            'filterType': filterType,
            'filter': filter
        });
    }

    function RemoveAllFromSelectedFiltersArray(filterType, filter) {
        _.remove($scope.selectedFiltersArray, function (_filter) {
            console.log(_filter.filterType + ' === ' + filterType);
            return _filter.filterType === filterType;
        });
    }

    //This is to add a new filter item to the selected filters array
    function RemoveFromSelectedFiltersArray(filterType, filter) {
        _.remove($scope.selectedFiltersArray, function (_filter) {
            return _filter.filterType === filterType && _filter.filter.name === filter.name && _filter.filter.value === filter.value;
        });
    }

    //This is to clear individual filter arrays
    function Clear_All_Filters() {

        $scope.selectedAirDates = [];
        $scope.selectedAdvertisers = [];
        $scope.selectedBrands = [];
        $scope.selectedPrograms = [];
        $scope.selectedStatuses = [];
        $scope.selectedTypes = [];
        $scope.selectedConditions = [];
    }

    function RemoveFromFilterByType(filterType, filter) {
        switch (filterType) {
        case 'AIRDATES':
            _.pull($scope.selectedAirDates, filter);
            break;
        case 'ADVERTISER':
            _.pull($scope.selectedAdvertisers, filter);
            break;
        case 'BRAND':
            _.pull($scope.selectedBrands, filter);
            break;
        case 'PROGRAM':
            _.pull($scope.selectedPrograms, filter);
            break;
        case 'STATUS':
            _.pull($scope.selectedStatuses, filter);
            break;
        case 'TYPE':
            _.pull($scope.selectedTypes, filter);
            break;
        case 'CONDITION':
            _.pull($scope.selectedConditions, filter);
            break;
        }
    }

    $jQL = jQuery.noConflict();

    //this will clear all the dropdown selections
    Clear_DropDown_Selections = function () {
        $jQL.fn.dropdown.ResetDropdowns();
    }

    //this will update the dropdown selections
    Update_DropDown_Selections = function (dropdownType, value) {
        $jQL.fn.dropdown.UpdateDropdownSelections(dropdownType, value);
    }

    /**
     * this is used to make Search Criteria before each SEARCH call!
     * @returns {{advertisers: *[], brands: *[], programs: *[], statuses: *[], types: *[], sort: string}}
     */
    function makeSearchCriteria() {
        return {
            //air_dates: '',
            advertisers: $scope.selectedAdvertisers,
            brands: $scope.selectedBrands,
            programs: $scope.selectedPrograms,
            statuses: $scope.selectedStatuses,
            types: $scope.selectedTypes,
            sort: '',
            conditions:  $scope.selectedConditions
        };
    }

    /**
     * Actual SEARCH
     */
    /*var _progressBar = ProgressBarsStorage.get('lib-pb');*/

    function search() {
        /*if(_progressBar) _progressBar.start();*/

        DataService.CI
            .search(makeSearchCriteria())
            .then(function (cis) {
                /*if(_progressBar) _progressBar.done();*/
                //console.log('Search Results: ' + cis.length);
                $scope.cis = cis;
                //update the count of pagination
                $scope.totalItems = cis.length;
            })
            .catch(function (e) {
                /*if(_progressBar) _progressBar.done();*/
                console.log(e);
            });
    }

    //////////////////////
    //END: Filters //
    //////////////////////

    $scope.display = 'grid';

    //////////////////////
    //START: Pagination //
    //////////////////////
    $scope.totalItems = $scope.counts.library;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 50;
    //$scope.limitBegin = 0;

    $scope.pageChanged = function () {
        //$scope.limitBegin = ($scope.currentPage * $scope.itemsPerPage);
        //console.log('###### LIBRARY currentPage: ' +$scope.currentPage);
    }

    $scope.PageSizeChange = function ($event, newSize) {
        $scope.itemsPerPage = parseInt(newSize, 10);
    }
    ////////////////////
    //END: Pagination //
    ////////////////////
}

angular
    .module('trafficbridge.tc')
    .controller('TrafficCoordinatorLibraryCtrl', [
        '$rootScope',
        '$scope',
        '$location',
        'mvIdentity',
        'DataService',
        //'_advertisers',
        'APP_CONFIG',
        TrafficCoordinatorLibraryCtrl
    ]);

//progressbar module
//angular.module('trafficbridge.cc', ['pg.progress-bars']);
