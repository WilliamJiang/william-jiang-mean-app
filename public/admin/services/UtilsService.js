/**
 * Created by PavaniKa on 3/18/2015.
 */

function UtilsService(ProgressBarsStorage) {

    return {
        getNameFromKey: function (key) {
            var words = key.split('_');
            return _.map(words, function (word) {
                return _.capitalize(word.toLowerCase());
            }).join(' ');
        },
        /**
         * this is copied from latest lodash api
         * @param value
         * @param start
         * @param end
         * @returns {boolean}
         */
        inRange: function (value, start, end) {
            start = +start || 0;
            if (typeof end === 'undefined') {
                end = start;
                start = 0;
            } else {
                end = +end || 0;
            }
            return value >= start && value < end;
        },

        showProgressBar: function (progressBarName) {
            if (progressBarName && ProgressBarsStorage.get(progressBarName)) {
                ProgressBarsStorage.get(progressBarName).start();
            }
        },
        hideProgressBar: function (progressBarName) {
            if (progressBarName && ProgressBarsStorage.get(progressBarName)) {
                ProgressBarsStorage.get(progressBarName).done();
            }
        },
        setProgressBarPercent: function (progressBarName, value) {
            if (progressBarName && ProgressBarsStorage.get(progressBarName)) {
                ProgressBarsStorage.get(progressBarName).set(+value);
            }
        },
        getFullNameOfUser: function (user) {
            return _.capitalize(_.trim(user.firstName)).charAt(0) + '. ' + _.capitalize(_.trim(user.lastName));
        }
    }
}

angular
    .module('tbadmin')
    .factory('UtilsService', [
        'ProgressBarsStorage',
        UtilsService
    ])
    .factory('modal', ['$compile', '$rootScope', function ($compile, $rootScope) {
        return function () {
            var elm;
            var modal = {
                open: function () {

                    var html = '<div class="modal" ng-style="modalStyle">{{modalStyle}}<div class="modal-dialog"><div class="modal-content"><div class="modal-header"></div><div class="modal-body"><div id="grid1" ui-grid="gridOptions" class="grid"></div></div><div class="modal-footer"><button id="buttonClose" class="btn btn-primary" ng-click="close()">Close</button></div></div></div></div>';
                    elm = angular.element(html);
                    angular.element(document.body).prepend(elm);

                    $rootScope.close = function () {
                        modal.close();
                    };

                    $rootScope.modalStyle = {"display": "block"};

                    $compile(elm)($rootScope);
                },
                close: function () {
                    if (elm) {
                        elm.remove();
                    }
                }
            };

            return modal;
        };
    }]);
