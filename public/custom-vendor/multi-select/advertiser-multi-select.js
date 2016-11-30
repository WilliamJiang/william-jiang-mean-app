/**
 * this is a customised module for 'Advertiser' filter ONLY, for performance reason.
 * william from: 06/03/2015
 */
angular.module('william-multi-select', ['ng']).directive('williamMultiSelect',
    ['$sce', '$timeout', '$templateCache',
        function ($sce, $timeout, $templateCache) {
            'use strict';

            return {
                restrict: 'AE',

                scope: {
                    // models
                    inputModel: '=',
                    outputModel: '=',

                    // settings based on attribute
                    isDisabled: '=',

                    // callbacks
                    onClear: '&',
                    onClose: '&',
                    onSearchChange: '&',
                    onItemClick: '&',
                    onOpen: '&',
                    onReset: '&',
                    onSelectAll: '&',
                    onSelectNone: '&',

                    // i18n
                    translation: '='
                },

                templateUrl: 'william-multi-select.htm',

                controller: ["$scope", "$http", "mvIdentity", "DataService",
                    function ($scope, $http, mvIdentity, DataService) {

                        function debounce(fn, delay) {
                            var timeoutId;
                            return function () {
                                var args = arguments;
                                $timeout.cancel(timeoutId);
                                timeoutId = $timeout(function () {
                                    fn.apply(null, args);
                                }, delay);
                            }();
                        }

                        $scope.searchChanged11 = function () {

                            if ($scope.inputModel.length > 0) {

                                if ($scope.inputLabel.labelFilter !== '') {

                                    $scope.filteredModel = [];

                                    var keyword = $scope.inputLabel.labelFilter.toUpperCase();
                                    var company_id = mvIdentity.getUser().affiliation.ref_id;

                                    DataService.MediaCompanies.getSearchAdvertisers(company_id, keyword)
                                        .then(function (data) {
                                            if (data.length > 0) {
                                                var ary = [], len = data.length, i;
                                                for (i = 0; i < len; i++) {
                                                    var tmp = _.find($scope.inputModel, function (m) {
                                                        if (m.value === data[i]) {
                                                            return m;
                                                        }
                                                    });
                                                    ary = ary.concat(tmp);
                                                }
                                                $scope.$evalAsync(function () {
                                                    $scope.filteredModel = ary;
                                                });
                                            }
                                            else {
                                                $scope.filteredModel = [];
                                            }
                                            /**
                                             var tmp = items.map(function (a) {
                                                return {
                                                    name: angular.filterWord(a.advertiser),
                                                    value: a.advertiser,
                                                    brands: a.brands,
                                                    selected: false
                                                }
                                            });
                                             $timeout(function () {
                                                $scope.$apply(function () {
                                                    $scope.filteredModel = tmp;
                                                });
                                            }, 0);
                                             */
                                        })
                                        .catch(function (error) {
                                            console.log('error in searching...', error);
                                            $scope.filteredModel = [];
                                        });
                                }
                                else {
                                    $scope.filteredModel = $scope.inputModel;
                                }
                            }
                        };

                        $scope.$watch('inputLabel.labelFilter11', function (newVal, oldVal) {
                            if (newVal === oldVal) {
                                return;
                            }

                            if ($scope.inputModel.length > 0) {

                                if ($scope.inputLabel.labelFilter !== '') {

                                    $scope.filteredModel = [];
                                    var keyword = newVal.toUpperCase();
                                    var company_id = mvIdentity.getUser().affiliation.ref_id;

                                    DataService.MediaCompanies.getSearchAdvertisers(company_id, keyword)
                                        .then(function (data) {

                                            if (data.length > 0) {
                                                var ary = [];
                                                for (var i = 0; i < data.length; i++) {
                                                    var tmp = _.find($scope.inputModel, function (m) {
                                                        if (m.value === data[i]) {
                                                            return m;
                                                        }
                                                    });
                                                    ary = ary.concat(tmp);
                                                }
                                                $scope.$evalAsync(function () {
                                                    $scope.filteredModel = ary;
                                                });
                                            }
                                            else {
                                                $scope.filteredModel = [];
                                            }
                                        })
                                        .catch(function (error) {
                                            $scope.filteredModel = [];
                                        });
                                }
                                else {
                                    //debounce(function () {
                                    $scope.filteredModel = $scope.inputModel;
                                    //}, 200);
                                }
                            }
                        });
                    }],

                link: function (scope, element, attrs) {

                    scope.varButtonLabel = '';
                    scope.spacingProperty = '';
                    scope.indexProperty = '';
                    scope.orientationH = false;
                    scope.orientationV = true;
                    scope.filteredModel = [];
                    scope.inputLabel = {labelFilter: ''};
                    scope.tabIndex = 0;
                    scope.lang = {};
                    scope.helperStatus = {
                        all: true,
                        none: true,
                        reset: true,
                        filter: true
                    };

                    var
                        prevTabIndex = 0,
                        helperItems = [],
                        helperItemsLength = 0,
                        checkBoxLayer = '',
                        formElements = [],
                        vMinSearchLength = 0,
                        clickedItem = null;

                    scope.clearClicked = function (e) {
                        scope.inputLabel.labelFilter = '';
                        scope.updateFilter();
                        scope.select('clear', e);
                    };

                    scope.numberToArray = function (num) {
                        return new Array(num);
                    };

                    scope.searchChanged = function () {
                        //scope.$evalAsync(function () {
                        scope.updateFilter();
                        //});
                        //$timeout(function () {
                        //    scope.$apply(function () {
                        //        scope.updateFilter();
                        //    });
                        //}, 0);
                    };

                    scope.updateFilter = function () {

                        if (scope.inputModel.length > 0) {

                            if (scope.inputLabel.labelFilter !== '') {

                                scope.filteredModel = [];

                                var i = 0, sim = scope.inputModel;
                                var len = sim.length;
                                var ary = [];
                                var keyword = scope.inputLabel.labelFilter.toUpperCase();

                                for (i = 0; i < len; i++) {
                                    if (sim[i]['name'].toUpperCase().indexOf(keyword) >= 0) {
                                        ary.push(sim[i]);
                                    }
                                }
                                scope.$evalAsync(function () {
                                    scope.filteredModel = ary;
                                });
                                //if (ary.length > 10) {
                                //    scope.$evalAsync(function () {
                                //        scope.filteredModel = angular.copy(ary.slice(0, 9));
                                //    });
                                //    $timeout(function () {
                                //        scope.$apply(function () {
                                //            scope.filteredModel = ary;
                                //        })
                                //    }, 1000);
                                //}
                                //else {
                                //    scope.filteredModel = ary;
                                //}
                            }
                            else {
                                //scope.$evalAsync(function () {
                                scope.filteredModel = scope.inputModel;
                                //});
                                //scope.getFormElements();
                            }
                        }
                        return false;
                    };

                    scope.getFormElements = function () {

                        formElements = [];
                        var
                            selectButtons = [],
                            checkboxes = [];

                        var inputField = angular.element(element[0]).find('input.inputFilter');
                        var clearButton = angular.element(element[0]).find('button.clearButton');

                        // Get checkboxes
                        if (!scope.helperStatus.all && !scope.helperStatus.none && !scope.helperStatus.reset && !scope.helperStatus.filter) {
                            checkboxes = element.children().children().next()[0].getElementsByTagName('input');
                        }
                        else {
                            checkboxes = element.children().children().next().children().next()[0].getElementsByTagName('input');
                        }

                        // Push them into global array formElements[]
                        for (var i = 0; i < selectButtons.length; i++) {
                            formElements.push(selectButtons[i]);
                        }
                        for (var i = 0; i < inputField.length; i++) {
                            formElements.push(inputField[i]);
                        }
                        for (var i = 0; i < clearButton.length; i++) {
                            formElements.push(clearButton[i]);
                        }
                        for (var i = 0; i < checkboxes.length; i++) {
                            formElements.push(checkboxes[i]);
                        }
                    };

                    // check if an item has attrs.groupProperty (be it true or false)
                    scope.isGroupMarker = function (item, type) {
                        if (typeof item[attrs.groupProperty] !== 'undefined' && item[attrs.groupProperty] === type) return true;
                        return false;
                    }


                    // call this function when an item is clicked
                    scope.syncItems = function (item, e, ng_repeat_index) {

                        e.preventDefault();
                        e.stopPropagation();

                        // if the directive is globaly disabled, do nothing
                        if (typeof attrs.disableProperty !== 'undefined' && item[attrs.disableProperty] === true) {
                            return false;
                        }

                        // if item is disabled, do nothing
                        if (typeof attrs.isDisabled !== 'undefined' && scope.isDisabled === true) {
                            return false;
                        }

                        // if end group marker is clicked, do nothing
                        if (typeof item[attrs.groupProperty] !== 'undefined' && item[attrs.groupProperty] === false) {
                            return false;
                        }

                        var index = scope.filteredModel.indexOf(item);

                        // if the start of group marker is clicked ( only for multiple selection! )
                        // how it works:
                        // - if, in a group, there are items which are not selected, then they all will be selected
                        // - if, in a group, all items are selected, then they all will be de-selected
                        if (typeof item[attrs.groupProperty] !== 'undefined' && item[attrs.groupProperty] === true) {

                            // this is only for multiple selection, so if selection mode is single, do nothing
                            if (typeof attrs.selectionMode !== 'undefined' && attrs.selectionMode.toUpperCase() === 'SINGLE') {
                                return false;
                            }

                            var i, j, k;
                            var startIndex = 0;
                            var endIndex = scope.filteredModel.length - 1;
                            var tempArr = [];

                            // nest level is to mark the depth of the group.
                            // when you get into a group (start group marker), nestLevel++
                            // when you exit a group (end group marker), nextLevel--
                            var nestLevel = 0;

                            // we loop throughout the filtered model (not whole model)
                            for (i = index; i < scope.filteredModel.length; i++) {

                                // this break will be executed when we're done processing each group
                                if (nestLevel === 0 && i > index) {
                                    break;
                                }

                                if (typeof scope.filteredModel[i][attrs.groupProperty] !== 'undefined' && scope.filteredModel[i][attrs.groupProperty] === true) {

                                    // To cater multi level grouping
                                    if (tempArr.length === 0) {
                                        startIndex = i + 1;
                                    }
                                    nestLevel = nestLevel + 1;
                                }

                                // if group end
                                else if (typeof scope.filteredModel[i][attrs.groupProperty] !== 'undefined' && scope.filteredModel[i][attrs.groupProperty] === false) {

                                    nestLevel = nestLevel - 1;

                                    // cek if all are ticked or not
                                    if (tempArr.length > 0 && nestLevel === 0) {

                                        var allTicked = true;

                                        endIndex = i;

                                        for (j = 0; j < tempArr.length; j++) {
                                            if (typeof tempArr[j][scope.tickProperty] !== 'undefined' && tempArr[j][scope.tickProperty] === false) {
                                                allTicked = false;
                                                break;
                                            }
                                        }

                                        if (allTicked === true) {
                                            for (j = startIndex; j <= endIndex; j++) {
                                                if (typeof scope.filteredModel[j][attrs.groupProperty] === 'undefined') {
                                                    if (typeof attrs.disableProperty === 'undefined') {
                                                        scope.filteredModel[j][scope.tickProperty] = false;
                                                        // we refresh input model as well
                                                        inputModelIndex = scope.filteredModel[j][scope.indexProperty];
                                                        scope.inputModel[inputModelIndex][scope.tickProperty] = false;
                                                    }
                                                    else if (scope.filteredModel[j][attrs.disableProperty] !== true) {
                                                        scope.filteredModel[j][scope.tickProperty] = false;
                                                        // we refresh input model as well
                                                        inputModelIndex = scope.filteredModel[j][scope.indexProperty];
                                                        scope.inputModel[inputModelIndex][scope.tickProperty] = false;
                                                    }
                                                }
                                            }
                                        }

                                        else {
                                            for (j = startIndex; j <= endIndex; j++) {
                                                if (typeof scope.filteredModel[j][attrs.groupProperty] === 'undefined') {
                                                    if (typeof attrs.disableProperty === 'undefined') {
                                                        scope.filteredModel[j][scope.tickProperty] = true;
                                                        // we refresh input model as well
                                                        inputModelIndex = scope.filteredModel[j][scope.indexProperty];
                                                        scope.inputModel[inputModelIndex][scope.tickProperty] = true;

                                                    }
                                                    else if (scope.filteredModel[j][attrs.disableProperty] !== true) {
                                                        scope.filteredModel[j][scope.tickProperty] = true;
                                                        // we refresh input model as well
                                                        inputModelIndex = scope.filteredModel[j][scope.indexProperty];
                                                        scope.inputModel[inputModelIndex][scope.tickProperty] = true;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                // if data
                                else {
                                    tempArr.push(scope.filteredModel[i]);
                                }
                            }
                        }

                        // if an item (not group marker) is clicked
                        else {

                            // If it's single selection mode
                            if (typeof attrs.selectionMode !== 'undefined' && attrs.selectionMode.toUpperCase() === 'SINGLE') {

                                // first, set everything to false
                                for (i = 0; i < scope.filteredModel.length; i++) {
                                    scope.filteredModel[i][scope.tickProperty] = false;
                                }
                                for (i = 0; i < scope.inputModel.length; i++) {
                                    scope.inputModel[i][scope.tickProperty] = false;
                                }

                                // then set the clicked item to true
                                scope.filteredModel[index][scope.tickProperty] = true;
                            }

                            // Multiple
                            else {
                                scope.filteredModel[index][scope.tickProperty] = !scope.filteredModel[index][scope.tickProperty];
                            }

                            // we refresh input model as well
                            var inputModelIndex = scope.filteredModel[index][scope.indexProperty];
                            scope.inputModel[inputModelIndex][scope.tickProperty] = scope.filteredModel[index][scope.tickProperty];
                        }

                        // we execute the callback function here
                        clickedItem = angular.copy(item);
                        if (clickedItem !== null) {
                            $timeout(function () {
                                delete clickedItem[scope.indexProperty];
                                delete clickedItem[scope.spacingProperty];
                                scope.onItemClick({data: clickedItem});
                                clickedItem = null;
                            }, 0);
                        }

                        scope.refreshOutputModel();
                        scope.refreshButton();

                        // We update the index here
                        prevTabIndex = scope.tabIndex;
                        scope.tabIndex = ng_repeat_index + helperItemsLength;

                        // Set focus on the hidden checkbox
                        e.target.focus();

                        // set & remove CSS style
                        scope.removeFocusStyle(prevTabIndex);
                        scope.setFocusStyle(scope.tabIndex);

                        if (typeof attrs.selectionMode !== 'undefined' && attrs.selectionMode.toUpperCase() === 'SINGLE') {
                            // on single selection mode, we then hide the checkbox layer
                            scope.toggleCheckboxes(e);
                        }
                    }

                    // update scope.outputModel
                    scope.refreshOutputModel = function () {

                        scope.outputModel = [];
                        var
                            outputProps = [],
                            tempObj = {};

                        if (typeof attrs.outputProperties !== 'undefined') {
                            outputProps = attrs.outputProperties.split(' ');
                            angular.forEach(scope.inputModel, function (value, key) {
                                if (
                                    typeof value !== 'undefined'
                                    && typeof value[attrs.groupProperty] === 'undefined'
                                    && value[scope.tickProperty] === true
                                ) {
                                    tempObj = {};
                                    angular.forEach(value, function (value1, key1) {
                                        if (outputProps.indexOf(key1) > -1) {
                                            tempObj[key1] = value1;
                                        }
                                    });
                                    var index = scope.outputModel.push(tempObj);
                                    delete scope.outputModel[index - 1][scope.indexProperty];
                                    delete scope.outputModel[index - 1][scope.spacingProperty];
                                }
                            });
                        }
                        else {
                            angular.forEach(scope.inputModel, function (value, key) {
                                if (
                                    typeof value !== 'undefined'
                                    && typeof value[attrs.groupProperty] === 'undefined'
                                    && value[scope.tickProperty] === true
                                ) {
                                    var temp = angular.copy(value);
                                    var index = scope.outputModel.push(temp);
                                    delete scope.outputModel[index - 1][scope.indexProperty];
                                    delete scope.outputModel[index - 1][scope.spacingProperty];
                                }
                            });
                        }
                    }

                    // refresh button label
                    scope.refreshButton = function () {

                        scope.varButtonLabel = '';
                        var ctr = 0;

                        // refresh button label...
                        if (scope.outputModel.length === 0) {
                            // https://github.com/isteven/angular-multi-select/pull/19
                            scope.varButtonLabel = scope.lang.nothingSelected;
                        }
                        else {
                            var tempMaxLabels = scope.outputModel.length;
                            if (typeof attrs.maxLabels !== 'undefined' && attrs.maxLabels !== '') {
                                tempMaxLabels = attrs.maxLabels;
                            }

                            // if max amount of labels displayed..
                            if (scope.outputModel.length > tempMaxLabels) {
                                scope.more = true;
                            }
                            else {
                                scope.more = false;
                            }

                            angular.forEach(scope.inputModel, function (value, key) {
                                if (typeof value !== 'undefined' && value[attrs.tickProperty] === true) {
                                    if (ctr < tempMaxLabels) {
                                        //PavaniKa 05/07/2015
                                        //scope.varButtonLabel += ( scope.varButtonLabel.length > 0 ? '</div>, <div class="buttonLabel">' : '<div class="buttonLabel">') + scope.writeLabel(value, 'buttonLabel');
                                        scope.varButtonLabel += scope.writeLabel(value, 'buttonLabel');
                                    }
                                    ctr++;
                                }
                            });

                            if (scope.more === true) {
                                if (tempMaxLabels > 0) {
                                    scope.varButtonLabel += '';
                                }
                                scope.varButtonLabel += '<strong>' + scope.outputModel.length + '</strong> Selected';
                            }
                        }
                        scope.varButtonLabel = $sce.trustAsHtml(scope.varButtonLabel + '<span class="caret"></span>');
                    }

                    // Check if a checkbox is disabled or enabled. It will check the granular control (disableProperty) and global control (isDisabled)
                    // Take note that the granular control has higher priority.
                    scope.itemIsDisabled = function (item) {

                        if (typeof attrs.disableProperty !== 'undefined' && item[attrs.disableProperty] === true) {
                            return true;
                        }
                        else {
                            if (scope.isDisabled === true) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }

                    }

                    // A simple function to parse the item label settings. Used on the buttons and checkbox labels.
                    //return $sce.trustAsHtml('&nbsp;' + item['name']);
                    scope.writeLabel = function (item) {
                        return $sce.trustAsHtml(item['name']);
                    }

                    // UI operations to show/hide checkboxes based on click event..
                    scope.toggleCheckboxes = function (e) {

                        // We grab the button
                        var clickedEl = element.children()[0];

                        // Just to make sure.. had a bug where key events were recorded twice
                        angular.element(document).off('click', scope.externalClickListener);
                        angular.element(document).off('keydown', scope.keyboardListener);

                        // The idea below was taken from another multi-select directive - https://github.com/amitava82/angular-multiselect
                        // His version is awesome if you need a more simple multi-select approach.

                        // close
                        if (angular.element(checkBoxLayer).hasClass('show')) {

                            angular.element(checkBoxLayer).removeClass('show');
                            angular.element(clickedEl).removeClass('buttonClicked');
                            angular.element(document).off('click', scope.externalClickListener);
                            angular.element(document).off('keydown', scope.keyboardListener);

                            // clear the focused element;
                            scope.removeFocusStyle(scope.tabIndex);
                            if (typeof formElements[scope.tabIndex] !== 'undefined') {
                                formElements[scope.tabIndex].blur();
                            }

                            // close callback
                            $timeout(function () {
                                scope.onClose();
                            }, 0);

                            // set focus on button again
                            element.children().children()[0].focus();
                        }
                        // open
                        else {
                            // clear filter
                            scope.inputLabel.labelFilter = '';
                            scope.updateFilter();

                            helperItems = [];
                            helperItemsLength = 0;

                            angular.element(checkBoxLayer).addClass('show');
                            angular.element(clickedEl).addClass('buttonClicked');

                            // Attach change event listener on the input filter.
                            // We need this because ng-change is apparently not an event listener.
                            angular.element(document).on('click', scope.externalClickListener);
                            angular.element(document).on('keydown', scope.keyboardListener);

                            // to get the initial tab index, depending on how many helper elements we have.
                            // priority is to always focus it on the input filter
                            scope.getFormElements();
                            scope.tabIndex = 0;

                            var helperContainer = angular.element(element[0].querySelector('.helperContainer'))[0];

                            if (typeof helperContainer !== 'undefined') {
                                for (var i = 0; i < helperContainer.getElementsByTagName('BUTTON').length; i++) {
                                    helperItems[i] = helperContainer.getElementsByTagName('BUTTON')[i];
                                }
                                helperItemsLength = helperItems.length + helperContainer.getElementsByTagName('INPUT').length;
                            }

                            // focus on the filter element on open.
                            if (element[0].querySelector('.inputFilter')) {
                                element[0].querySelector('.inputFilter').focus();
                                scope.tabIndex = scope.tabIndex + helperItemsLength - 2;
                                // blur button in vain
                                angular.element(element).children()[0].blur();
                            }
                            // if there's no filter then just focus on the first checkbox item
                            else {
                                if (!scope.isDisabled) {
                                    scope.tabIndex = scope.tabIndex + helperItemsLength;
                                    if (scope.inputModel.length > 0) {
                                        formElements[scope.tabIndex].focus();
                                        scope.setFocusStyle(scope.tabIndex);
                                        // blur button in vain
                                        angular.element(element).children()[0].blur();
                                    }
                                }
                            }

                            // open callback
                            scope.onOpen();
                        }
                    }

                    // handle clicks outside the button / multi select layer
                    scope.externalClickListener = function (e) {

                        var targetsArr = element.find(e.target.tagName);
                        for (var i = 0; i < targetsArr.length; i++) {
                            if (e.target == targetsArr[i]) {
                                return;
                            }
                        }

                        angular.element(checkBoxLayer.previousSibling).removeClass('buttonClicked');
                        angular.element(checkBoxLayer).removeClass('show');
                        angular.element(document).off('click', scope.externalClickListener);
                        angular.element(document).off('keydown', scope.keyboardListener);

                        // close callback
                        $timeout(function () {
                            scope.onClose();
                        }, 0);

                        // set focus on button again
                        element.children().children()[0].focus();
                    }

                    // select All / select None / reset buttons
                    scope.select = function (type, e) {

                        var helperIndex = helperItems.indexOf(e.target);
                        scope.tabIndex = helperIndex;

                        switch (type.toUpperCase()) {
                            case 'CLEAR':
                                scope.tabIndex = scope.tabIndex + 1;
                                scope.onClear();
                                break;
                            case 'FILTER':
                                scope.tabIndex = helperItems.length - 1;
                                break;
                            default:
                        }
                    }

                    // just to create a random variable name
                    function genRandomString(length) {
                        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                        var temp = '';
                        for (var i = 0; i < length; i++) {
                            temp += possible.charAt(Math.floor(Math.random() * possible.length));
                        }
                        return temp;
                    }

                    // prepare original index
                    scope.prepareIndex = function () {
                        var ctr = 0;
                        angular.forEach(scope.filteredModel, function (value, key) {
                            value[scope.indexProperty] = ctr;
                            ctr++;
                        });
                    }

                    // navigate using up and down arrow
                    scope.keyboardListener = function (e) {

                        var key = e.keyCode ? e.keyCode : e.which;
                        var isNavigationKey = false;

                        // ESC key (close)
                        if (key === 27) {
                            e.preventDefault();
                            e.stopPropagation();
                            scope.toggleCheckboxes(e);
                        }


                        // next element ( tab, down & right key )
                        else if (key === 40 || key === 39 || ( !e.shiftKey && key == 9 )) {

                            isNavigationKey = true;
                            prevTabIndex = scope.tabIndex;
                            scope.tabIndex++;
                            if (scope.tabIndex > formElements.length - 1) {
                                scope.tabIndex = 0;
                                prevTabIndex = formElements.length - 1;
                            }
                            while (formElements[scope.tabIndex].disabled === true) {
                                scope.tabIndex++;
                                if (scope.tabIndex > formElements.length - 1) {
                                    scope.tabIndex = 0;
                                }
                                if (scope.tabIndex === prevTabIndex) {
                                    break;
                                }
                            }
                        }

                        // prev element ( shift+tab, up & left key )
                        else if (key === 38 || key === 37 || ( e.shiftKey && key == 9 )) {
                            isNavigationKey = true;
                            prevTabIndex = scope.tabIndex;
                            scope.tabIndex--;
                            if (scope.tabIndex < 0) {
                                scope.tabIndex = formElements.length - 1;
                                prevTabIndex = 0;
                            }
                            while (formElements[scope.tabIndex].disabled === true) {
                                scope.tabIndex--;
                                if (scope.tabIndex === prevTabIndex) {
                                    break;
                                }
                                if (scope.tabIndex < 0) {
                                    scope.tabIndex = formElements.length - 1;
                                }
                            }
                        }

                        if (isNavigationKey === true) {

                            e.preventDefault();

                            // set focus on the checkbox
                            formElements[scope.tabIndex].focus();
                            var actEl = document.activeElement;

                            if (actEl.type.toUpperCase() === 'CHECKBOX') {
                                scope.setFocusStyle(scope.tabIndex);
                                scope.removeFocusStyle(prevTabIndex);
                            }
                            else {
                                scope.removeFocusStyle(prevTabIndex);
                                scope.removeFocusStyle(helperItemsLength);
                                scope.removeFocusStyle(formElements.length - 1);
                            }
                        }

                        isNavigationKey = false;
                    }

                    // set (add) CSS style on selected row
                    scope.setFocusStyle = function (tabIndex) {
                        angular.element(formElements[tabIndex]).parent().parent().parent().addClass('multiSelectFocus');
                    }

                    // remove CSS style on selected row
                    scope.removeFocusStyle = function (tabIndex) {
                        angular.element(formElements[tabIndex]).parent().parent().parent().removeClass('multiSelectFocus');
                    }

                    /*********************
                     *********************
                     *
                     * 1) Initializations
                     *
                     *********************
                     *********************/

                        // attrs to scope - attrs-scope - attrs - scope
                        // Copy some properties that will be used on the template. They need to be in the scope.
                    scope.groupProperty = attrs.groupProperty;
                    scope.tickProperty = attrs.tickProperty;
                    scope.directiveId = attrs.directiveId;

                    // Unfortunately I need to add these grouping properties into the input model
                    var tempStr = genRandomString(5);
                    scope.indexProperty = 'idx_' + tempStr;
                    scope.spacingProperty = 'spc_' + tempStr;

                    // set orientation css
                    if (typeof attrs.orientation !== 'undefined') {

                        if (attrs.orientation.toUpperCase() === 'HORIZONTAL') {
                            scope.orientationH = true;
                            scope.orientationV = false;
                        }
                        else {
                            scope.orientationH = false;
                            scope.orientationV = true;
                        }
                    }

                    // get elements required for DOM operation
                    checkBoxLayer = element.children().children().next()[0];

                    // set max-height property if provided
                    if (typeof attrs.maxHeight !== 'undefined') {
                        var layer = element.children().children().children()[0];
                        angular.element(layer).attr("style", "height:" + attrs.maxHeight + "; overflow-y:scroll;");
                    }

                    // some flags for easier checking
                    for (var property in scope.helperStatus) {
                        if (scope.helperStatus.hasOwnProperty(property)) {
                            if (
                                typeof attrs.helperElements !== 'undefined'
                                && attrs.helperElements.toUpperCase().indexOf(property.toUpperCase()) === -1
                            ) {
                                scope.helperStatus[property] = false;
                            }
                        }
                    }
                    if (typeof attrs.selectionMode !== 'undefined' && attrs.selectionMode.toUpperCase() === 'SINGLE') {
                        scope.helperStatus['all'] = false;
                        scope.helperStatus['none'] = false;
                    }

                    // helper button icons.. I guess you can use html tag here if you want to.
                    scope.icon = {};
                    scope.icon.selectAll = '&#10003;';    // a tick icon
                    scope.icon.selectNone = '&times;';     // x icon
                    scope.icon.reset = '&#8630;';     // undo icon
                    // this one is for the selected items
                    scope.icon.tickMark = '&#10003;';    // a tick icon

                    // configurable button labels
                    if (typeof attrs.translation !== 'undefined') {
                        scope.lang.selectAll = $sce.trustAsHtml(scope.icon.selectAll + '&nbsp;&nbsp;' + scope.translation.selectAll);
                        scope.lang.selectNone = $sce.trustAsHtml(scope.icon.selectNone + '&nbsp;&nbsp;' + scope.translation.selectNone);
                        scope.lang.reset = $sce.trustAsHtml(scope.icon.reset + '&nbsp;&nbsp;' + scope.translation.reset);
                        scope.lang.search = scope.translation.search;
                        scope.lang.nothingSelected = $sce.trustAsHtml(scope.translation.nothingSelected);
                    }
                    else {
                        scope.lang.selectAll = $sce.trustAsHtml(scope.icon.selectAll + '&nbsp;&nbsp;Select All');
                        scope.lang.selectNone = $sce.trustAsHtml(scope.icon.selectNone + '&nbsp;&nbsp;Select None');
                        scope.lang.reset = $sce.trustAsHtml(scope.icon.reset + '&nbsp;&nbsp;Reset');
                        scope.lang.search = 'Search...';
                        scope.lang.nothingSelected = 'All ';
                    }
                    scope.icon.tickMark = $sce.trustAsHtml(scope.icon.tickMark);

                    // min length of keyword to trigger the filter function
                    if (typeof attrs.MinSearchLength !== 'undefined' && parseInt(attrs.MinSearchLength) > 0) {
                        vMinSearchLength = Math.floor(parseInt(attrs.MinSearchLength));
                    }

                    /*******************************************************
                     *******************************************************
                     *
                     * 2) Logic starts here, initiated by watch 1 & watch 2
                     *
                     *******************************************************
                     *******************************************************/

                    scope.$watch('inputModel', function (newVal) {
                        if (newVal) {
                            scope.refreshOutputModel();
                            scope.refreshButton();
                        }
                    }, true);

                    // watch2 for changes in input model as a whole
                    scope.$watch('inputModel', function (newVal) {
                        if (newVal) {
                            scope.updateFilter();
                            scope.prepareIndex();
                            scope.refreshOutputModel();
                            scope.refreshButton();
                        }
                    });


                    //william added:
                    scope.$watch('inputLabel.labelFilter', function (newVal) {
                        var buttonToggle = angular.element(element[0]).find('.inputFilter').parent();
                        if (newVal && newVal.length > 0) {
                            if (!buttonToggle.hasClass('is-focus')) {
                                buttonToggle.addClass('is-focus');
                            }
                        }
                        else {
                            if (buttonToggle.hasClass('is-focus')) {
                                buttonToggle.removeClass('is-focus');
                            }
                        }
                    });

                    // watch for changes in directive state (disabled or enabled)
                    scope.$watch('isDisabled', function (newVal) {
                        scope.isDisabled = newVal;
                    });

                    // Init scroll bar
                    angular.element(element[0]).find('.multiSelect').find('.wrap-checkboxContainer').jScrollPane({
                        verticalGutter: 0,
                        autoReinitialise: true,
                        autoReinitialiseDelay: 100,
                        contentWidth: '0px'
                    });


                    var $ae = angular.element(element[0]);
                    $ae.find('button.clearButton').bind('click', function (e) {
                        scope.inputLabel.labelFilter = '';
                        scope.updateFilter();
                        scope.select('clear', e);
                    });

                    // Implementation click on Close button of drop-down
                    $ae.find('.checkboxLayer').find('.btn-primary').bind('click', function (e) {
                        $ae.find('.multiSelect').removeClass('buttonClicked');
                        $ae.find('.checkboxLayer').removeClass('show');
                        e.preventDefault();
                    });

                }
            }
        }]).run(['$templateCache', function ($templateCache) {
        var template =
            '<span class="multiSelect inlineBlock">' +
                // main button
            '<button id="{{directiveId}}" type="button"' +
            'ng-click="toggleCheckboxes( $event ); refreshSelectedItems(); refreshButton(); prepareIndex();"' +
            'ng-bind-html="varButtonLabel"' +
            'ng-disabled="disable-button"' +
            '>' +
            '</button>' +
                // overlay layer
            '<div class="checkboxLayer" style="z-index:1000;">' +
                // container of the helper elements
            '<div class="helperContainer" ng-if="helperStatus.filter || helperStatus.all || helperStatus.none || helperStatus.reset ">' +
                // container of the first 3 buttons, select all, none and reset
            '<div class="line" ng-if="helperStatus.all || helperStatus.none || helperStatus.reset ">' +
                // select all
            '<button type="button" class="helperButton"' +
            'ng-disabled="isDisabled"' +
            'ng-if="helperStatus.all"' +
            'ng-click="select( \'all\', $event );"' +
            'ng-bind-html="lang.selectAll">' +
            '</button>' +
                // select none
            '<button type="button" class="helperButton"' +
            'ng-disabled="isDisabled"' +
            'ng-if="helperStatus.none"' +
            'ng-click="select( \'none\', $event );"' +
            'ng-bind-html="lang.selectNone">' +
            '</button>' +
                // reset
            '<button type="button" class="helperButton reset"' +
            'ng-disabled="isDisabled"' +
            'ng-if="helperStatus.reset"' +
            'ng-click="select( \'reset\', $event );"' +
            'ng-bind-html="lang.reset">' +
            '</button>' +
            '</div>' +
                // the search box
                /* add ".is-entering" class to change search button to clear button*/
            '<div class="line" style="position:relative" ng-if="helperStatus.filter">' +
                // textfield
            '<input placeholder="{{lang.search}}" type="text"' +
                // 'ng-click="select( \'filter\', $event )" ' +
            'ng-model="inputLabel.labelFilter" ' +
            'ng-change="searchChanged()" class="inputFilter" ' +
            'ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 200, \'blur\': 0 } }" ng-trim="false" />' +
                // clear button
            '<button type="button" class="searchButton"></button> ' +
            '<button type="button" class="clearButton" ng-click="clearClicked( $event )" >' +
            '<span class="close-icon glyphicon glyphicon-remove"></span>' +
            '</button> ' +
            '</div> ' +
            '</div> ' +
                // selection items
            '<div class="wrap-checkboxContainer">' +
            '<div class="checkBoxContainer tb-multi-select-list">' +
            '<div ' +
            'ng-repeat="item in filteredModel" class="multiSelectItem"' +
            'ng-class="{selected: item[ tickProperty ], horizontal: orientationH, vertical: orientationV, multiSelectGroup:item[ groupProperty ], disabled:itemIsDisabled( item )}"' +
            'ng-click="syncItems( item, $event, $index );" ' +
            'ng-mouseleave="removeFocusStyle( tabIndex );"> ' +
                //SLOW! 'ng-bind-html="writeLabel( item )">'
            '<div class="acol" ng-if="item[ spacingProperty ] > 0" ng-repeat="i in numberToArray( item[ spacingProperty ] ) track by $index">' +
            '</div>  ' +
            '<div class="acol">' +
            '<label>' +
            '<input class="checkbox focusable" type="checkbox" ' +
            'ng-disabled="itemIsDisabled( item )" ' +
            'ng-checked="item[ tickProperty ]" ' +
            'ng-click="syncItems( item, $event, $index )" />' +
            '<span class="tb-multi-select-span" ' +
            'ng-class="{disabled:itemIsDisabled( item )}" >' +
            '{{item.name}}' +
            '</span>' +
            '</label>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="close-search">' +
            '<button type="button" class="btn btn-primary">Close</button>' +
            '</div>' +
            '</div>' +
            '</span>';

        $templateCache.put('william-multi-select.htm', template);
    }]);
