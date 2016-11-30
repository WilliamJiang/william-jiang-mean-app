function CopyCoordinatorLibraryCtrl($rootScope,
                                    $scope,
                                    $location,
                                    $modal,
                                    $q,
                                    $log,
                                    $window,
                                    mvIdentity,
                                    DataService,
                                    FilterService,
                                    NotifierService,
                                    UtilsService,
                                    APP_CONFIG) {

    'use strict';

    //reset the owners list, for IgnoredBy dropdown
    //FilterService.resetOwnerNowList();

    $rootScope.returnTo = '/cc/home/library';
    $scope.advertisersList = FilterService.getAdvertisersList();

    $rootScope.$on('refreshAdvertisers', function () {
        $scope.$apply(function () {
            $scope.advertisersList = FilterService.getAdvertisersList();
        });
    });

    if ($scope.SEARCH_ID) {
        $scope.cis = [];
        $scope.hideTotals = true;
    }

    if ($scope.advertisersList.length === 0) {

        var promises = [
            DataService.MediaCompanies.getAdvertisers(mvIdentity.currentUser.affiliation.ref_id),
            DataService.MediaCompanies.getProgramsForNetwork(mvIdentity.currentUser.affiliation.ref_id, mvIdentity.currentUser.affiliation.metadata.active_network),
            DataService.CI.getStatusesForSelectInLibrary(),
            DataService.CI.getTypesForSelect(mvIdentity.currentUser.affiliation.ref_id),
            DataService.CI.getConditionsForSelect(),
            DataService.MediaCompanies.getUsers(mvIdentity.currentUser.affiliation.ref_id)
        ];

        $q.all(promises)
            .then(function (data) {
                // caching the $q.all's return.
                // immediately display first 10 items, then lazy loading the rest.
                var ads_data = data[0].slice(0, 10);

                FilterService.setAdvertisersList(ads_data);
                //console.log('first 10 advertiser items', ads_data);

                FilterService.setProgramsList(data[1]);
                FilterService.setStatusesList(data[2]);
                FilterService.setTypesList(data[3]);
                FilterService.setConditionsList(data[4]);
                FilterService.setOwnersList(data[5]);
                FilterService.resetBrandsList();
                $scope.brandsList = [];

                return data[0];
            })
            .then(function (advertisers) {

                FilterService.setFullAdvertisersList(advertisers);
            })
            .then(function () {
                if ($scope.SEARCH_ID) {

                    DataService.CI.getSavedSearchById($scope.SEARCH_ID)
                        .then(function (searchCriteria) {

                            Populate_Filters(searchCriteria);

                        }, function (err) {
                            console.log('Error while getting saved search criteria: ' + err);
                        });
                }
            })
            .catch(function (e) {
                return e.toString();
            });
    }
    else if ($scope.SEARCH_ID) {

        DataService.CI.getSavedSearchById($scope.SEARCH_ID)
            .then(function (searchCriteria) {

                Populate_Filters(searchCriteria);

            }, function (err) {
                console.log('Error while getting saved search criteria: ' + err);
            });
    }
    else {
        /**
         * the following not work:
         * $scope.selectedAdvertisersList = [];
         * $scope.selectedStatusList = []; ...
         * should be:
         */
        FilterService.resetList.call(FilterService.getAdvertisersList());
        FilterService.resetList.call(FilterService.getBrandsList());
        FilterService.resetList.call(FilterService.getProgramsList());
        FilterService.resetList.call(FilterService.getOwnersList());
        FilterService.resetList.call(FilterService.getStatusesList());
        FilterService.resetList.call(FilterService.getConditionsList());
        FilterService.resetList.call(FilterService.getTypesList());
        FilterService.resetBrandsList();
        $scope.selectedBrandsList = [];
    }


    function Populate_Filters(searchCriteria) {

        $scope.process_air_date = function (startDate, endDate) {

            $scope.ClearAirDatesFromFiltersArray();

            var _airDatesName = startDate.format("MMM DD") + ' - ' + endDate.format("MMM DD");
            var _airDatesVal = {
                'air_date_start': startDate,
                'air_date_end': endDate
            };

            $scope.selectedAirDates.push(_airDatesVal);
            AddToSelectedFiltersArray('AIRDATES', {name: _airDatesName, value: _airDatesVal});
        };


        if (searchCriteria && searchCriteria.query) {

            var air_date_start = searchCriteria.query.air_date_start;
            var air_date_end = searchCriteria.query.air_date_end;

            if (_.isObject(air_date_start) && _.isObject(air_date_end)) {
                $scope.Set_AirDates(air_date_start, air_date_end);
                $scope.process_air_date(moment(air_date_start), moment(air_date_end));
            }

            if (searchCriteria.query.sort) {
                $scope.selectedSortBy = searchCriteria.query.sort;
                setSortOrder();
            }

            var sq = searchCriteria.query;
            var airDates = $scope.selectedAirDates.map(function (o) {
                return {air_date_start: o.air_date_start, air_date_end: o.air_date_end}
            });

            var ad = sq.advertisers.map(function (a) {
                return {name: a.name, value: a.value}
            });
            var brand = sq.brands.map(function (b) {
                return {name: b.name, value: b.value}
            });
            var program = sq.programs.map(function (p) {
                return {name: p.name, value: p.value}
            });
            var owner = sq.owners.map(function (o) {
                return {name: o.name, value: o.value}
            });
            var status = sq.statuses.map(function (s) {
                return {name: s.name, value: s.value}
            });
            var type = sq.types.map(function (t) {
                return {name: t.name, value: t.value}
            });
            var condition = sq.conditions.map(function (c) {
                return {name: c.name, value: c.value}
            });
            var query = {
                airDates: airDates,
                advertisers: ad,
                brands: brand,
                programs: program,
                owners: owner,
                statuses: status,
                types: type,
                conditions: condition,
                sort: $scope.orderBypredicate,
                pagination: {
                    FILTERS_CHANGED: $scope.pagination.FILTERS_CHANGED,
                    SORTBY_CHANGED: $scope.pagination.SORTBY_CHANGED,
                    PAGE_LIMIT: $scope.pagination.PAGE_LIMIT,
                    PAGE_OFFSET: $scope.pagination.PAGE_OFFSET,
                    SAVED_SEARCH: true //true only when we load a saved search from left nav
                }
            };

            /*Set to true, it will trigger the new search by clearing any cache*/
            //query.pagination.FILTERS_CHANGED = true;

            /**
             * william added to reload filter choice
             */
            $scope.advertisersList = FilterService.getAdvertisersList();
            $scope.brandsList = FilterService.getBrandsList();
            $scope.programsList = FilterService.getProgramsList();
            $scope.typesList = FilterService.getTypesList();
            $scope.ownersList = FilterService.getOwnersList();
            $scope.statusList = FilterService.getStatusesList();
            $scope.conditionsList = FilterService.getConditionsList();
            var len = 0, i = 0;

            $scope.advertisersList.forEach(function (a) {
                len = searchCriteria.query.advertisers.length;
                if(a.selected) a.selected = false;
                for (i = 0; i < len; i++) {
                    if (searchCriteria.query.advertisers[i].value === a.value) {
                        a.selected = true;
                        FilterService.setBrandsList(a.brands.map(function (brandObj) {//name) {
                            return {
                                name: angular.filterWord(brandObj.name),
                                value: brandObj.name,
                                selected: false
                            }
                        }));
                        $scope.AddToSelectedFiltersArray('ADVERTISER', a);
                    }
                }
            });
            $scope.brandsList.forEach(function (a) {
                len = searchCriteria.query.brands.length;
                for (i = 0; i < len; i++) {
                    if (searchCriteria.query.brands[i].value === a.value) {
                        a.selected = true;
                        $scope.AddToSelectedFiltersArray('BRAND', a);
                    }
                }
            });
            $scope.conditionsList.forEach(function (a) {
                len = searchCriteria.query.conditions.length;
                for (i = 0; i < len; i++) {
                    if (searchCriteria.query.conditions[i].value === a.value) {
                        a.selected = true;
                        $scope.AddToSelectedFiltersArray('CONDITION', a);
                    }
                }
            });
            $scope.ownersList.forEach(function (a) {
                len = searchCriteria.query.owners.length;
                for (i = 0; i < len; i++) {
                    if (searchCriteria.query.owners[i].value === a.value) {
                        a.selected = true;
                        $scope.AddToSelectedFiltersArray('OWNER', a);
                    }
                }
            });
            $scope.programsList.forEach(function (a) {
                len = searchCriteria.query.programs.length;
                for (i = 0; i < len; i++) {
                    if (searchCriteria.query.programs[i].name === a.name) {
                        a.selected = true;
                        $scope.AddToSelectedFiltersArray('PROGRAM', a);
                    }
                }
            });
            $scope.statusList.forEach(function (a) {
                len = searchCriteria.query.statuses.length;
                for (i = 0; i < len; i++) {
                    if (searchCriteria.query.statuses[i].value === a.value) {
                        a.selected = true;
                        $scope.AddToSelectedFiltersArray('STATUS', a);
                    }
                }
            });
            $scope.typesList.forEach(function (a) {
                len = searchCriteria.query.types.length;
                for (i = 0; i < len; i++) {
                    if (searchCriteria.query.types[i].value === a.value) {
                        a.selected = true;
                        $scope.AddToSelectedFiltersArray('TYPE', a);
                    }
                }
            });

            //bring search results
            UtilsService.showProgressBar('library_progress');
            DataService.CI
                .search(query)
                .then(function (data) {

                    $scope.cis = data.cis;
                    $scope.pagination.totalItems = data.totalCount;
                    $scope.hideTotals = false;
                    UtilsService.hideProgressBar('library_progress');
                })
                .catch(function (e) {
                    UtilsService.hideProgressBar('library_progress');
                });
        }
    }

    //////////////////////
    //START: Filters //
    //////////////////////

    ////////////////////////////////////////
    //AIR DATES
    $scope.selectedAirDates = [];
    $scope.onAirDatesSelect = function (startDate, endDate, action) {
        if (action === 'APPLY') {
            //clear the previous dates, because there can be only one set of dates
            $scope.ClearAirDatesFromFiltersArray();

            //apply
            var _airDatesName = startDate.format("MMM DD") + ' - ' + endDate.format("MMM DD");
            var _airDatesVal = {
                'air_date_start': startDate,
                'air_date_end': endDate
            };

            $scope.selectedAirDates.push(_airDatesVal);
            AddToSelectedFiltersArray('AIRDATES', {name: _airDatesName, value: _airDatesVal});

        } else {
            //clear
            $scope.ClearAirDatesFromFiltersArray();
        }

        //filter is changed
        $scope.pagination.FILTERS_CHANGED = true;
        //console.log('onAirDatesSelect');
        search();
    };

    $scope.ClearAirDatesFromFiltersArray = function () {
        //clear selected air dates array. This is for Services.
        $scope.selectedAirDates = [];
        //clear selected Filters array, this is for UI.
        _.remove($scope.selectedFiltersArray, function (filter) {
            return filter.filterType === 'AIRDATES';
        });
    };

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
        //sortBy is changed
        $scope.pagination.SORTBY_CHANGED = true;
        //trigger the correct search
        if ($scope.SHOW_IGNORED_CIS) {
            search_ignored();
        } else {
            //console.log('onChangeSortBy');
            search();
        }
    };

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
            case 'Condition':
                $scope.orderBypredicate = 'condition';
                break;
            case 'Owner':
                $scope.orderBypredicate = 'owner';
                break;
            default:
                $scope.orderBypredicate = '-updated_at';
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
        //Clear Air Dates
        $scope.Clear_AirDates();
        //clear all dropdown selections
        Clear_DropDown_Selections();
        //filter is changed
        $scope.pagination.FILTERS_CHANGED = true;
        //update search results
        //console.log('ClearAllFilters');
        search();
    };

    //This is to clear a particular search filter
    $scope.ClearSelectedFilter = function ($event, filterItem) {

        if (filterItem.filterType === 'AIRDATES') {
            //this will clear the air_start_date & air_end_date
            $scope.ClearAirDatesFromFiltersArray();
            //this will clear the dates in the date range selector component
            $scope.Clear_AirDates();
        }
        else if (filterItem.filterType === 'ADVERTISER') {

            var brands = [];
            FilterService.getAdvertisersList().every(function (ad, index) {
                if (ad.value === filterItem.filter.value) {
                    brands = ad.brands;
                    return false;
                }
                return true;
            });
            $scope.brandsList = FilterService.getBrandsList();
            for (var i = 0; i < brands.length; i++) {
                _.remove($scope.brandsList, function (f) {
                    return f.value === brands[i].name;
                });
                _.remove($scope.selectedBrandsList, function (f) {
                    return f.value === brands[i].name;
                });
                _.remove($scope.selectedFiltersArray, function (f) {
                    return f.filterType === 'BRAND' && f.filter.value === brands[i].name;
                });
            }

            FilterService.updateSelectedList.apply($scope.selectedAdvertisersList, [filterItem.filter]);
            FilterService.syncDropdown.apply($scope.advertisersList, [filterItem.filter]);
            $scope.RemoveFromSelectedFiltersArray('ADVERTISER', filterItem.filter);

        }
        else if (filterItem.filterType === 'BRAND') {
            $scope.brandsList = FilterService.getBrandsList();
            FilterService.updateSelectedList.call($scope.selectedBrandsList, filterItem.filter);
            FilterService.syncDropdown.call($scope.brandsList, filterItem.filter);
            $scope.RemoveFromSelectedFiltersArray('BRAND', filterItem.filter);
        }
        else if (filterItem.filterType === 'PROGRAM') {

            FilterService.updateSelectedList.call($scope.selectedProgramsList, filterItem.filter);
            FilterService.syncDropdown.call($scope.programsList, filterItem.filter);
            $scope.RemoveFromSelectedFiltersArray('PROGRAM', filterItem.filter);
        }
        else if (filterItem.filterType === 'OWNER') {

            FilterService.updateSelectedList.call($scope.selectedOwnersList, filterItem.filter);
            FilterService.syncDropdown.call($scope.ownersList, filterItem.filter);
            $scope.RemoveFromSelectedFiltersArray('OWNER', filterItem.filter);
        }

        else if (filterItem.filterType === 'STATUS') {

            FilterService.updateSelectedList.call($scope.selectedStatusList, filterItem.filter);
            FilterService.syncDropdown.call($scope.statusList, filterItem.filter);
            $scope.RemoveFromSelectedFiltersArray('STATUS', filterItem.filter);
        }
        else if (filterItem.filterType === 'TYPE') {

            FilterService.updateSelectedList.call($scope.selectedTypesList, filterItem.filter);
            FilterService.syncDropdown.call($scope.typesList, filterItem.filter);
            $scope.RemoveFromSelectedFiltersArray('TYPE', filterItem.filter);

        }
        else if (filterItem.filterType === 'CONDITION') {

            FilterService.updateSelectedList.call($scope.selectedConditionsList, filterItem.filter);
            FilterService.syncDropdown.call($scope.conditionsList, filterItem.filter);
            $scope.RemoveFromSelectedFiltersArray('CONDITION', filterItem.filter);
        }
        //TODO: remove it, not use anymore.
        else {
            //remove from selected filters array
            _.pull($scope.selectedFiltersArray, filterItem);
            //also remove from the corresponding filter arrays
            RemoveFromFilterByType(filterItem.filterType, filterItem.filter);
            //clear corresponding dropdown selection
            Update_DropDown_Selections(filterItem.filterType, filterItem.filter.value);
            //update the search results
        }
        //filter is changed
        $scope.pagination.FILTERS_CHANGED = true;
        //console.log('ClearSelectedFilter');
        search();
    };

    //This is to add a new filter item to the selected filters array
    function AddToSelectedFiltersArray(filterType, filter) {
        //if all is selected clear the array
        $scope.selectedFiltersArray.push({
            'filterType': filterType,
            'filter': filter
        });
    }

    $scope.AddToSelectedFiltersArray = AddToSelectedFiltersArray;

    function RemoveAllFromSelectedFiltersArray(filterType, filter) {
        _.remove($scope.selectedFiltersArray, function (_filter) {
            //$log.debug(_filter.filterType + ' === ' + filterType);
            return _filter.filterType === filterType;
        });
    }

    //This is to add a new filter item to the selected filters array
    function RemoveFromSelectedFiltersArray(filterType, filter) {
        _.remove($scope.selectedFiltersArray, function (_filter) {
            return _filter.filterType === filterType && _filter.filter.name === filter.name && _filter.filter.value === filter.value;
        });
    }

    $scope.RemoveFromSelectedFiltersArray = RemoveFromSelectedFiltersArray;

    //This is to clear individual filter arrays
    function Clear_All_Filters() {

        $scope.selectedAirDates = [];
        $scope.resetAdvertisers();
        $scope.resetBrands();
        //$scope.resetPrograms();
        //$scope.resetOwners();
        //$scope.resetTypes();
        //$scope.resetStatus();
        //$scope.resetConditions();

        FilterService.resetList.call($scope.programsList, $scope.selectedProgramsList);
        FilterService.resetList.call($scope.ownersList, $scope.selectedOwnersList);
        FilterService.resetList.call($scope.typesList, $scope.selectedTypesList);
        FilterService.resetList.call($scope.statusList, $scope.selectedStatusList);
        FilterService.resetList.call($scope.conditionsList, $scope.selectedConditionsList);
    }

    function RemoveFromFilterByType(filterType, filter) {
        switch (filterType) {
            case 'AIRDATES':
                _.pull($scope.selectedAirDates, filter);
                break;
        }
    }

    var $jQL = jQuery.noConflict();

    //this will clear all the dropdown selections
    var Clear_DropDown_Selections = function () {
        $jQL.fn.dropdown.ResetDropdowns();
    };

    //this will update the dropdown selections
    var Update_DropDown_Selections = function (dropdownType, value) {
        $jQL.fn.dropdown.UpdateDropdownSelections(dropdownType, value);
    };

    /**
     * this is used to make Search Criteria before each SEARCH call!
     * @returns {{advertisers: *[], brands: *[], programs: *[], statuses: *[], types: *[], sort: string}}
     */
    function makeSearchCriteria() {

        var airDates = $scope.selectedAirDates.map(function (o) {
            return {air_date_start: o.air_date_start, air_date_end: o.air_date_end}
        });
        var ad = $scope.selectedAdvertisersList.map(function (a) {
            return {name: a.name, value: a.value}
        });
        var brand = $scope.selectedBrandsList.map(function (b) {
            return {name: b.name, value: b.value}
        });
        var program = $scope.selectedProgramsList.map(function (p) {
            return {name: p.name, value: p.value}
        });
        var owner = $scope.selectedOwnersList.map(function (o) {
            return {name: o.name, value: o.value}
        });
        var status = $scope.selectedStatusList.map(function (s) {
            return {name: s.name, value: s.value}
        });
        var type = $scope.selectedTypesList.map(function (t) {
            return {name: t.name, value: t.value}
        });
        var condition = $scope.selectedConditionsList.map(function (c) {
            return {name: c.name, value: c.value}
        });

        return {
            airDates: airDates,
            advertisers: ad,
            brands: brand,
            programs: program,
            owners: owner,
            statuses: status,
            types: type,
            conditions: condition,
            sort: $scope.orderBypredicate, //$scope.selectedSortBy
            pagination: {
                FILTERS_CHANGED: $scope.pagination.FILTERS_CHANGED,
                SORTBY_CHANGED: $scope.pagination.SORTBY_CHANGED,
                PAGE_LIMIT: $scope.pagination.PAGE_LIMIT,
                PAGE_OFFSET: $scope.pagination.PAGE_OFFSET
            }
        };
    }

    /**
     * Actual SEARCH
     */
    /*var _progressBar = ProgressBarsStorage.get('lib-pb');*/

    function search() {
        calculateOffset_Limit();
        /*if(_progressBar) _progressBar.start();*/
        UtilsService.showProgressBar('library_progress');
        DataService.CI
            .search(makeSearchCriteria())
            .then(function (data) {
                /*if(_progressBar) _progressBar.done();*/
                //$log.debug('Search Results returned: ' + cis.length);
                //reset the flags
                $scope.pagination.FILTERS_CHANGED = false;
                $scope.pagination.SORTBY_CHANGED = false;

                $scope.cis = data.cis;
                $scope.pagination.totalItems = data.totalCount;
                $scope.hideTotals = false;
                //update the count of pagination
                //$scope.pagination.totalItems = cis.length;
                UtilsService.hideProgressBar('library_progress');
            })
            .catch(function (e) {
                /*if(_progressBar) _progressBar.done();*/
                //$log.debug(e);
                UtilsService.hideProgressBar('library_progress');
            });
    }

    $scope.search = search;

    //////////////////////
    //END: Filters //
    //////////////////////

    $scope.display = 'grid';

    //////////////////////
    //START: Pagination //
    //////////////////////
    //we are sending cis and totalCount for library initial load
    var data = $scope.cis;
    $scope.cis = data.cis;
    $scope.pagination = {};
    $scope.pagination.totalItems = data.totalCount; //$scope.counts.library;
    $scope.pagination.currentPage = 1;
    $scope.pagination.itemsPerPage = 50;
    //$scope.limitBegin = 0;

    $scope.pagination.pageChanged = function () {
        //$scope.limitBegin = ($scope.currentPage * $scope.itemsPerPage);
        //$log.debug('###### LIBRARY currentPage: ' +$scope.currentPage);
        //console.log('pageChanged');
        //trigger the correct search
        if ($scope.SHOW_IGNORED_CIS) {
            search_ignored();
        } else {
            search();
        }
    };

    $scope.pagination.PageSizeChange = function ($event, newSize) {
        $scope.pagination.itemsPerPage = parseInt(newSize, 10);
        //console.log('PageSizeChange');
        //trigger the correct search
        if ($scope.SHOW_IGNORED_CIS) {
            search_ignored();
        } else {
            search();
        }
    };

    /*PavaniKa - New server side paging*/
    $scope.pagination.PAGE_OFFSET = 0;
    $scope.pagination.PAGE_LIMIT = $scope.pagination.itemsPerPage;
    $scope.pagination.FILTERS_CHANGED = false;
    $scope.pagination.SORTBY_CHANGED = false;

    function calculateOffset_Limit() {
        $scope.pagination.PAGE_OFFSET = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage;
        $scope.pagination.PAGE_LIMIT = $scope.pagination.itemsPerPage;

        //console.log('Offset: ' + $scope.pagination.PAGE_OFFSET + ', Limit: ' + $scope.pagination.PAGE_LIMIT);
        //+ ', Filters changed: ' + $scope.pagination.FILTERS_CHANGED + ', SortBy changed: ' + $scope.pagination.SORTBY_CHANGED);
    }

    $scope.calculateOffset_Limit = calculateOffset_Limit;
    ////////////////////
    //END: Pagination //
    ////////////////////

    // <editor-fold desc="Save Search">
    $scope.Save_Search = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        var saveSearchModalInstance = $modal.open({
            templateUrl: 'SAVE_SEARCH_MODAL',
            controller: 'SaveSearchCtrl',
            windowClass: 'save-search',
            backdrop: 'static',
            resolve: {
                filtersData: function () {
                    return makeSearchCriteria();
                }
            }
        });

        saveSearchModalInstance.result.then(function (searchName) {

            $log.debug('Save Search Modal closed at: ' + moment().format('h:mm:ss a') + ', ' + searchName);

        }, function (reason) {

            $log.debug('Save Search Modal dismissed at: ' + moment().format('h:mm:ss a'));

        });
    };
    //// </editor-fold>

    //This is already used in CopyCoordinatorQueueCtrl which is the parent controller. So no need this again here.
    //add scrolling behavior to the 'content' section only once
    /*var _SCROLL_BEHAVIOR_ADDED_LIBRARY = false;

     //on content loaded:
     $scope.$on('$includeContentLoaded', function (event, url) {

     if (_.endsWith(url, 'ci_card.html')) {

     if (!_SCROLL_BEHAVIOR_ADDED_LIBRARY) {

     //$log.debug('Library $includeContentLoaded: ' + url);
     _SCROLL_BEHAVIOR_ADDED_LIBRARY = true;

     if (TPVTB.AddScrollingToLibraryScreen && _.isFunction(TPVTB.AddScrollingToLibraryScreen)) {
     //this is defined in library.js from Agility!
     TPVTB.AddScrollingToLibraryScreen();
     }
     }
     }
     });*/

    $scope.$on('REFRESH_LIBRARY', function (event, done) {
        //trigger the correct search
        if ($scope.SHOW_IGNORED_CIS) {
            //this is to trigger the ignored by DB query, because the CI data might be changed.
            $scope.pagination.IGNORED_BY_CHANGED = true;
            search_ignored();
        } else {
            //this is to trigger the new DB query, because the CI data might be changed.
            $scope.pagination.SORTBY_CHANGED = true;
            search();
        }
    });

    $scope.onPrintClick = function ($event) {
        $window.print();
        $event.preventDefault();
        $event.stopPropagation();
    };

    // <editor-fold desc="Sho Ignored CIs">
    /**
     * this is to show the Ignored CIs when the 'show Ignored CIs' link is clicked
     * @param $event
     */
    $scope.SHOW_IGNORED_CIS = false;
    $scope.showIgnoredCIs = function ($event) {
        $scope.SHOW_IGNORED_CIS = true;
        //this is to trigger the ignored by DB query
        $scope.pagination.IGNORED_BY_CHANGED = true;
        reset_CI_Counts();
        search_ignored();
    };

    /**
     * this is used to reset the CI counts between Library view & Ignored CIs view.
     */
    function reset_CI_Counts() {
        $scope.cis = [];
        //temporarily hide the count in UI.
        $scope.hideTotals = true;
        //new count will be set in the search callback
        $scope.pagination.totalItems = 0;
        //reset page offset to load first page
        $scope.pagination.PAGE_OFFSET = 0;
    }

    function search_ignored() {
        calculateOffset_Limit();
        UtilsService.showProgressBar('library_progress_ignored');
        DataService.CI
            .search_ignored(makeSearchCriteria_ignored())
            .then(function (data) {
                //reset the search flags
                $scope.pagination.IGNORED_BY_CHANGED = false;
                $scope.pagination.SORTBY_CHANGED = false;
                //set new data
                $scope.cis = data.cis;
                $scope.pagination.totalItems = data.totalCount;
                //show counts in UI again
                $scope.hideTotals = false;
                UtilsService.hideProgressBar('library_progress_ignored');
            })
            .catch(function (e) {
                UtilsService.hideProgressBar('library_progress_ignored');
            });
    }

    $scope.search_ignored = search_ignored;

    function makeSearchCriteria_ignored() {
        var ignoredByIds = FilterService.getSelectedIgnoredByUsersList();

        return {
            ignoredBy: ignoredByIds,
            sort: $scope.orderBypredicate,
            pagination: {
                IGNORED_BY_CHANGED: $scope.pagination.IGNORED_BY_CHANGED,
                SORTBY_CHANGED: $scope.pagination.SORTBY_CHANGED,
                PAGE_LIMIT: $scope.pagination.PAGE_LIMIT,
                PAGE_OFFSET: $scope.pagination.PAGE_OFFSET
            }
        };
    }

    $scope.showLibraryCIs = function ($event) {
        $scope.SHOW_IGNORED_CIS = false;
        //this is to trigger the library DB query
        $scope.pagination.FILTERS_CHANGED = true;
        //reset CI Counts
        reset_CI_Counts();
        //search library CIs
        search();
    };

    $scope.getUserNameFromId = function (userId) {
        return FilterService.getIgnoredUserNameFromId(userId);
    };
    //// </editor-fold>
}

angular
    .module('trafficbridge.cc')
    .controller('CopyCoordinatorLibraryCtrl', [
        '$rootScope',
        '$scope',
        '$location',
        '$modal',
        '$q',
        '$log',
        '$window',
        'mvIdentity',
        'DataService',
        "FilterService",
        'NotifierService',
        'UtilsService',
        'APP_CONFIG',
        CopyCoordinatorLibraryCtrl
    ]);

//progressbar module
//angular.module('trafficbridge.cc', ['pg.progress-bars']);
