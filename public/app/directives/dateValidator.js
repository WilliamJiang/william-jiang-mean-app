angular
    .module('tbDirectives', [
        'tbDirectives.date-validator'
    ]);

// There are 2 redundant directives for date validation, only differing by the parentScope deref - kenmc

angular
    .module('tbDirectives.date-validator', [])
    .directive('dateValidatorCC', function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attr, ngModel) {
                var parentScope = scope;

                function validate(value, oldValue, parentScope) {
                    //prevent validation on initial load
                    if (value !== oldValue) {
                        if (value !== undefined && value != null) {
                            ngModel.$setValidity('badDate', true); //not a valid range
                            ngModel.$setValidity('badDateFormat', true); //not in MM/DD/YYYY format
                            var dateMoment;
                            var compareDateMoment;

                            if (value instanceof Date) {
                                dateMoment = moment(value);
                            } else {
                                dateMoment = moment(value, ['MM/DD/YYYY'], true);
                            }

                            if (dateMoment.isValid()) { //['MM/DD/YYYY', 'M/DD/YYYY', 'MM/D/YYYY']
                                //valid date, now range comparison
                                var compareValue = null;
                                var isThisStartDate = true;

                                switch (ngModel.$name) {
                                    case 'air_date_start':
                                        compareValue = parentScope.ci.air_date_end;
                                        isThisStartDate = true;
                                        break;
                                    case 'air_date_end':
                                        compareValue = parentScope.ci.air_date_start;
                                        isThisStartDate = false;
                                        break;
                                }

                                if (compareValue instanceof Date) {
                                    compareDateMoment = moment(compareValue);
                                } else {
                                    compareDateMoment = moment(compareValue, ['MM/DD/YYYY'], true);
                                }

                                //check if compareValue is also a valid date
                                if (compareDateMoment.isValid()) {
                                    var result;

                                    if (isThisStartDate) {
                                        result = dateMoment.isBefore(compareValue) || dateMoment.isSame(compareValue);
                                    } else {
                                        result = dateMoment.isAfter(compareValue) || dateMoment.isSame(compareValue);
                                    }

                                    ngModel.$setValidity('badDate', result);
                                }

                            } else {
                                //not a valid date
                                ngModel.$setValidity('badDateFormat', false);
                            }
                        }
                    }
                }

                scope.$watch(function () {
                    return ngModel.$viewValue;
                }, validate);
            }
        };
    })
    .directive('dateValidatorTC', function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attr, ngModel) {
                var parentScope = scope;

                function validate(value, oldValue, parentScope) {
                    //prevent validation on initial load
                    if (value !== oldValue) {
                        if (value !== undefined && value != null) {
                            ngModel.$setValidity('badDate', true); //not a valid range
                            ngModel.$setValidity('badDateFormat', true); //not in MM/DD/YYYY format
                            var dateMoment;
                            var compareDateMoment;

                            if (value instanceof Date) {
                                dateMoment = moment(value);
                            } else {
                                dateMoment = moment(value, ['MM/DD/YYYY'], true);
                            }

                            if (dateMoment.isValid()) { //['MM/DD/YYYY', 'M/DD/YYYY', 'MM/D/YYYY']
                                //valid date, now range comparison
                                var compareValue = null;
                                var isThisStartDate = true;

                                switch (ngModel.$name) {
                                    case 'air_date_start':
                                        compareValue = parentScope.air_date_end;
                                        isThisStartDate = true;
                                        break;
                                    case 'air_date_end':
                                        compareValue = parentScope.air_date_start;
                                        isThisStartDate = false;
                                        break;
                                }

                                if (compareValue instanceof Date) {
                                    compareDateMoment = moment(compareValue);
                                } else {
                                    compareDateMoment = moment(compareValue, ['MM/DD/YYYY'], true);
                                }

                                //check if compareValue is also a valid date
                                if (compareDateMoment.isValid()) {
                                    var result;

                                    if (isThisStartDate) {
                                        result = dateMoment.isBefore(compareValue) || dateMoment.isSame(compareValue);
                                    } else {
                                        result = dateMoment.isAfter(compareValue) || dateMoment.isSame(compareValue);
                                    }

                                    ngModel.$setValidity('badDate', result);
                                }

                            } else {
                                //not a valid date
                                ngModel.$setValidity('badDateFormat', false);
                            }
                        }
                    }
                }

                scope.$watch(function () {
                    return ngModel.$viewValue;
                }, validate);
            }
        };
    });

