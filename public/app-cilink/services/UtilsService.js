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
        }
    }
}

angular
    .module('app')
    .factory('UtilsService', [
        'ProgressBarsStorage',
        UtilsService
    ]);
