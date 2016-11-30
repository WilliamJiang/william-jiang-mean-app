/* jshint node:true */
var logger = require('../../utilities/logger');
var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function(app) {

    var db = app.locals.db,
        DataAccessGroup = db.DataAccessGroup;

    function getGroups(user) {
        return DataAccessGroup.find({mediaCompanyID: user.affiliation.company._id, $or: [ { allUsers: true }, { users: user.userName } ] }).sort('name').execAsync();
    }

    function getAccessibleNetworks(user){
        var allNetworks = user.affiliation && user.affiliation.company? user.affiliation.company.networks:[],
            accessibleNetworks = null;
        return new Promise(function(resolve, reject) {
            getGroups(user).then(function (groups){
                groups = groups || [];
                var groupsLen = groups.length, group = null;
                accessibleNetworks = [];
                for(var ind=0; ind< groupsLen; ind++){
                    group = groups[ind];
                    if(group.allNetworks && allNetworks){
                        _.forEach(allNetworks, function (network, key) {
                            accessibleNetworks.push(network.name);
                        });
                        break;
                    }else{
                        accessibleNetworks = accessibleNetworks.concat(group.networks);
                    }
                }
                accessibleNetworks = accessibleNetworks.filter(function(item, index, accessibleNetworks){
                    return index === accessibleNetworks.indexOf(item);
                });

                return resolve(accessibleNetworks);

            }).catch(function(err){
                return reject(err);
            })
                });

    }

    function getAccessibleGroups(req, res) {
        getGroups(user).then(function (groups){
            var accessibleGroups = [];
            groups = groups || [];
            groups.forEach(function(group){
                if(group.allUsers || (group.users && group.users.indexOf(req.user.userName) > -1)){
                    accessibleGroups.push(group);
                }
            });
            res.send(accessibleGroups);
        }).catch(function(err){
            return res.status(500).send({ error: error.toString() });
        })
            };

    return {
        getAccessibleNetworks: getAccessibleNetworks,
        getGroups: getGroups,
        getAccessibleGroups: getAccessibleGroups
    };
};
