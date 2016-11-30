"use strict";

module.exports = function (app) {

    var db = app.locals.db;
    var Network = db.network;

    function getNetworks(req, res) {

        var select = '';
        Network
            .find({}, select)
            .sort({'updated_at': -1})
            .execAsync()
            .then(function (networks) {
                logger.debug(networks, 'getNetworks: ');

                res.send(networks);
            })
            .catch(function (err) {

                logger.error(error, 'Error while getting the networks list.');

                res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function getNetworkById(req, res) {

        var nid = req.params.nid;
        Network
            .findOneAsync({_id: nid})
            .then(function (network) {

                logger.debug(user, 'getUserById: ');

                res.send(user);
            })
            .catch(function (error) {

                logger.error(error, 'Error while getting the user by Id.');

                return res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function getNetworkByName(req, res) {

        var nname = req.params.network_name;
        Network
            .findOneAsync({name: nname})
            .then(function (network) {
                logger.debug(user, 'getUserByName: ');

                res.send(user);
            })
            .catch(function (error) {

                logger.error(error, 'Error while getting the user by name.');

                return res.send({
                    status: 'ERROR',
                    error: error.toString()
                });
            });
    }

    function createNetwork(req, res) {

        var network = req.body;
        return Network
            .createAsync(network)
            .then(function (network) {

                logger.debug(user, 'createUser');

                res.send(user);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while creating the User ');

                return res.status(500).send({reason: error.toString()});
            });
    }

    function updateNetwork(req, res) {
        var nid = req.params.nid;
        var network = req.body;

        return Network
            .updateAsync({nid: nid}, network)
            .then(function (network) {

                logger.debug(user, 'updateUser');
                res.send(user);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while updating the User ' + userId);
                return res.status(500).send({reason: error.toString()});

            });
    }

    function inactiveNetwork(req, res) {

        var nId = req.params.nid;
        Network
            .updateAsync({nid: nid}, {active: 'N'})
            .then(function (network) {

                logger.debug(Network, 'inactiveNetwork');
                res.send(network);
            })
            .catch(function (error) {

                logger.error(error, 'ERROR: while updating the Network ' + nId);
                return res.status(500).send({reason: error.toString()});

            });
    }

    return {
        getNetworks: getNetworks,
        getNetworkById: getNetworkById,
        getNetworkByName: getNetworkByName,
        createNetwork: createNetwork,
        updateNetwork: updateNetwork,
        deleteNetwork: inactiveNetwork
    }
};