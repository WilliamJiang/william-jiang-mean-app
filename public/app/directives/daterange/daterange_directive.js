/**
 * Created by PavaniKa on 4/8/2015.
 */

var tbcc = angular.module('app');


tbcc.directive('dateRangeSelect', ['$templateCache', function ($templateCache) {
    "use strict";

    return {
        templateUrl: 'date-range-template.htm',
        restrict: "EA",
        replace: true,
        scope: false,
        controller: ['$scope', function ($scope) {
            //TODO:??
        }],
        link: function (scope, element, attrs, parentCtrl) {

            function onAirDatesSelect(start, end, label) {
                /*
                 * This is taken care in the apply event
                 * because applying the default dates are not working from here!
                 */
                //use angular apply for quick update in UI.
                /*scope.$apply( function() {
                 scope.ci.air_date_start = moment(start).startOf('day');
                 scope.ci.air_date_end = moment(end).startOf('day');
                 });*/
            }

            scope.start_date_field = scope.ci ? angular.copy(scope.ci.air_date_start) : angular.copy(scope.air_date_start);
            scope.end_date_field = scope.ci ? angular.copy(scope.ci.air_date_end) : angular.copy(scope.air_date_end);

            //scope.start_date_field = convertDateStringToDate(scope.start_date_field);
            //scope.end_date_field = convertDateStringToDate(scope.end_date_field);

            var _el = angular.element(element[0]);

            //create data range selector
            _el.daterangepicker({
                startDate: scope.start_date_field ? moment(scope.start_date_field).toDate() : moment(),
                endDate: scope.end_date_field ? moment(scope.end_date_field).toDate() : moment(),
                format: attrs.format || 'MM/DD/YYYY',
                showWeekNumbers: true,
                opens: attrs.opens || 'right',
                locale: {
                    firstDay: 1,
                    applyLabel: attrs['apply-label'] || 'OK',
                    cancelLabel: attrs['cancel-label'] || 'Clear'
                },
                timePicker: false,
                drops: 'down'
                //,parentEl: _el.parent('.modal-content')
            }, onAirDatesSelect);

            //Events
            /**
             * this is fired when we click on the cancle button
             */
            _el.on('cancel.daterangepicker', function (event, picker) {

                return false;
                /*scope.$apply(function () {
                    //scope.start_date_field = null;
                    //scope.end_date_field = null;
                    if (scope.ci) {
                        scope.ci.air_date_start = null;
                        scope.ci.air_date_end = null;
                    } else {
                        scope.air_date_start = null;
                        scope.air_date_end = null;
                    }

                    /!**
                     * this will be used in Library screen!
                     *!/
                    if (angular.isFunction(scope.onAirDatesSelect)) {
                        scope.onAirDatesSelect(null, null, 'CLEAR');
                    }
                });*/
            });
            /**
             * this is fired when we click on the apply button ('OK')
             */
            _el.on('apply.daterangepicker', function (event, picker) {

                scope.$apply(function () {
                    scope.start_date_field = moment(picker.startDate).startOf('day');
                    scope.end_date_field = moment(picker.endDate).startOf('day');
                    if (scope.ci) {
                        scope.ci.air_date_start = moment(picker.startDate).startOf('day');
                        scope.ci.air_date_end = moment(picker.endDate).startOf('day');
                    } else {
                        scope.air_date_start = moment(picker.startDate).startOf('day');
                        scope.air_date_end = moment(picker.endDate).startOf('day');
                    }

                    /**
                     * this will be used in Library screen!
                     */
                    if (angular.isFunction(scope.onAirDatesSelect)) {
                        scope.onAirDatesSelect(moment(picker.startDate).startOf('day'), moment(picker.endDate).startOf('day'), "APPLY");
                    }
                });
            });

            //william:
            //_el.on('show.daterangepicker', function (event, picker) {
            //
            //    var s = !!scope.ci ? angular.copy(scope.ci.air_date_start) : angular.copy(scope.air_date_start);
            //    var e = !!scope.ci ? angular.copy(scope.ci.air_date_end) : angular.copy(scope.air_date_end);
            //
            //    if (!s) s = picker.oldStartDate;
            //    if (!e) e = picker.oldEndDate;
            //
            //    picker.setStartDate(s);
            //    picker.setEndDate(e);
            //});

            scope.Set_AirDates = function (startDate, endDate) {
                scope.start_date_field = moment(startDate).startOf('day');
                scope.end_date_field = moment(endDate).startOf('day');
                if (scope.ci) {
                    scope.ci.air_date_start = moment(startDate).startOf('day');
                    scope.ci.air_date_end = moment(endDate).startOf('day');
                } else {
                    scope.air_date_start = moment(startDate).startOf('day');
                    scope.air_date_end = moment(endDate).startOf('day');
                }

                var picker = _el.data('daterangepicker');

                picker.setStartDate(scope.start_date_field);
                picker.setEndDate(scope.end_date_field);
            };

            scope.Clear_AirDates = function () {
                scope.start_date_field = null;
                scope.end_date_field = null;
                if (scope.ci) {
                    scope.ci.air_date_start = null;
                    scope.ci.air_date_end = null;
                } else {
                    scope.air_date_start = null;
                    scope.air_date_end = null;
                }
            };

            //TODO: RegEx for start & end inputs to prevent BS entries??

            var _modalInstance = scope.modalInstance;

            if (_modalInstance) {
                _modalInstance.result.then(function () {
                    //nothing!
                }, function () {
                    var picker = _el.data('daterangepicker');

                    if (picker.element.hasClass('active')) {
                        picker.hide();
                        //TODO: prevent parent modal from closing??
                    }
                });
            }
        }
    }
}]).run(['$templateCache', function ($templateCache) {
    var template =
        '<div class="dropdown">' +
        '<button type="button" class="btn btn-default dropdown-toggle btn-dropdown btn-air-dates btn-rollover">' +
        '{{ start_date_field | amDateFormat:"MMM DD" }} - {{ end_date_field | amDateFormat:"MMM DD" }}' +
            /*"ci-calendar" is in filing screen. "calendar-icon" is in edit metadata screen*/
        '<a href="javascript:void(0)" class="calendar-icon"><span class="icon-tpIcons02-09"></span></a>' +
        '</button>' +
        '</div>';
    $templateCache.put('date-range-template.htm', template);
}]);