/**
 * Created by PavaniKa on 3/18/2015.
 */

/**
 * brackatize filter surrounds the string with brackets
 */
angular
    .module('tbFilters')
    .filter('bracketize', function () {
        return function (value) {
            return _.isEmpty(value) ? value : '(' + value + ')';
        };
    });

/**
 * filter that splits the string with a splitBy value and capitalizes the words
 *
 */
angular
    .module('tbFilters')
    .filter('nameFromKey', function () {
        return function (key, splitBy) {
            var _splitBy = splitBy || '_';
            if (_.isEmpty(key)) {
                return '';
            } else {
                var words = key.split(_splitBy);
                return _.map(words, function (word) {
                    return _.capitalize(word.toLowerCase());
                }).join(' ');
            }
        };
    });

/**
 * filter to append a trailing comma
 */
angular
    .module('tbFilters')
    .filter('appendComma', function () {
        return function (value) {
            return _.isEmpty(value) ? value : value + ',';
        };
    })
    .filter('lowerCaseDash', function () {
        return function (text) {
            return text.replace(/\s+/g, '-').toLowerCase();
        }
    });