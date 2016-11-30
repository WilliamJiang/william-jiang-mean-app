var RandExp = require('randexp');
var PWD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

exports.generatePassword = function() {
    return (new RandExp(/^[a-z]{4}$/).gen() + new RandExp(/^[A-Z]{4}$/).gen() + new RandExp(/^[0-9]{4}$/).gen()).split('').sort(function(){return 0.5-Math.random()}).join('')
};

exports.validatePassword = function(pwd) {
    var patt = new RegExp(PWD_REGEX);
    return patt.test(pwd);
}