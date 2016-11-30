/* jshint node:true */
var _ = require('lodash');

function escapeRegEx(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function nameFromKey(key) {

    if (!key) {
	return null;
    }
    
    var words = key.split('_');

    return _.map(words,function(word) {
        return _.capitalize(word.toLowerCase());
    }).join(' ');
}

module.exports = {
    escapeRegEx: escapeRegEx,
    nameFromKey: nameFromKey
}
