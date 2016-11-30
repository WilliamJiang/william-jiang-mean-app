var tbcc = angular.module('app');

tbcc.factory('FilterService', [
    "mvIdentity", "DataService", "$timeout", "$rootScope",
    function (mvIdentity, DataService, $timeout, $rootScope) {
        "use strict";

        var advertisersList = [];
        var full_advertisersList = [];
        var brandsList = [];
        var programsList = [];
        var statusList = [];
        var typesList = [];
        var ownersList = [];
        var conditionsList = [];

        /**
         * Owners Filter in Now Queue
         */
        var ownersNowList = [];
        var selectedOwnersNowList = [];

        /**
         * IgnoredBy Filter in Library's Ignored CIs Queue
         */
        var ignoredByList = [];
        var selectedIgnoredByList = [];

        return {
            /**
             * Only advertisers word need first-uppercase, rest-lowercase at this time.
             * Conditions, brands ???
             */
            setAdvertisersList: function (advertisers) {
                /**
                 * for user re-login, the list should be refreshed.
                 * if (advertisersList.length === 0)
                 */
                advertisersList = advertisers.map(function (a) {
                    return {
                        name: angular.filterWord(a.advertiser),
                        value: a.advertiser,
                        brands: a.brands,
                        selected: false
                    }
                });
            },
            setFullAdvertisersList: function (full_advertisers) {
                full_advertisersList = full_advertisers.map(function (a) {
                    return {
                        name: angular.filterWord(a.advertiser),
                        value: a.advertiser,
                        brands: a.brands,
                        selected: false
                    }
                });

                if (full_advertisersList.length > 0) {
                    $timeout(function () {
                        advertisersList = full_advertisersList;
                        $rootScope.$emit('refreshAdvertisers');
                    }, 0);
                }
            },
            getFullAdvertisersList: function () {
                return full_advertisersList;
            },

                // get whole array
            getAdvertisersList: function () {
                return advertisersList;
            },

            setBrandsList: function (brands) {
                //brandsList = angular.extend({}, brandsList, brands);angular.extend(brandsList, brands);
                brandsList = brandsList.concat(brands);
            },

            //name: Abc, value: ABC
            removeBrands: function (brands) {
                for (var i = 0; i < brands.length; i++) {
                    _.remove(this, function (f) {
                        return f.value === brands[i].name;
                    });
                }
            },

            resetBrandsList: function () {
                brandsList = [];
            },

            getBrandsList: function () {
                return brandsList;
            },

            setProgramsList: function (programs) {
                if (programs && programs.length > 0) {
                    programsList = programs.map(function (p) {
                        return {
                            name: p.name,
                            value: p.name,
                            selected: false
                        }
                    });
                }
                else {
                    programsList = [];
                }
                programsList.sort(function (a, b) {
                    return 2 * (a.name > b.name) - 1;
                });
            },

            getProgramsList: function () {
                return programsList;
            },

            setStatusesList: function (statuses) {
                if (statuses && statuses.length > 0) {
                    statusList = statuses.map(function (s) {
                        return {
                            name: s.name,
                            value: s.value,
                            selected: false
                        }
                    });
                }
                else {
                    statusList = [];
                }
            },
            getStatusesList: function () {
                return statusList;
            },

            setTypesList: function (types) {
                if (types && types.length > 0) {
                    typesList = types.map(function (t) {
                        return {
                            name: t.name,
                            value: t.value,
                            selected: false
                        }
                    });
                }
                else {
                    typesList = [];
                }
            },
            getTypesList: function () {
                return typesList;
            },

            setConditionsList: function (conditions) {
                if (conditions && conditions.length > 0) {
                    conditionsList = conditions.map(function (c) {
                        return {
                            name: c.name,
                            value: c.value,
                            selected: false
                        }
                    });
                }
                else {
                    conditionsList = [];
                }
            },

            getConditionsList: function () {
                return conditionsList;
            },

            setOwnersList: function (owners) {
                if (owners && owners.length > 0) {
                    ownersList = owners.map(function (o) {
                        return {
                            name: o.fullName, // + ' (' + o.userName + ')',
                            value: o.userName,
                            fname: o.firstName + ' ' + o.lastName,
                            selected: false
                        }
                    });
                }
                else {
                    ownersList = [];
                }
            },
            getOwnersList: function () {
                return ownersList;
            },


            /**
             *  IgnoredBy Filter in Library's Ignored CIs Queue
             * @param owners
             */
            //var ignoredByList = [];
            //var selectedIgnoredByList = [];
            setIgnoredByUsersList: function (users) {
                if (users && users.length > 0) {
                    //1. Set All Owners List
                    ignoredByList = users.map(function (o) {
                        return {
                            _id: o._id, //User ID
                            name: o.fullName,
                            value: o._id, //UserID //o.userName,
                            fname: o.firstName + ' ' + o.lastName,
                            selected: false
                        }
                    });
                }
                else {
                    ignoredByList = [];
                }
            },
            getIgnoredByUsersList: function () {
                return ignoredByList;
            },
            getIgnoredUserNameFromId: function(userId) {
                var ignoredUsers = _.filter(ignoredByList, function (_user) {
                    return _user._id === userId;
                });
                var user = '';
                if(ignoredUsers.length > 0) {
                    user = ignoredUsers[0].fname;
                }

                return user;
            },
            addToSelectedIgnoredByUsersList: function(user) {
                selectedIgnoredByList.push(user);
            },
            removeFromSelectedIgnoredByUsersList: function(user) {
                _.remove(selectedIgnoredByList, function (_user) {
                    return _user.name === user.name && _user.value === user.value;
                });
            },
            getSelectedIgnoredByUsersList: function() {
                return selectedIgnoredByList;
            },
            getSelectedIgnoredByUserIds: function() {
                var _userIds = _.pluck(selectedIgnoredByList, 'value');
                return _userIds;
            },
            resetIgnoredByUsers: function() {
                //reset the selected users list
                selectedIgnoredByList = [];
                //reset the users list
                _.forEach(ignoredByList, function(user){
                   user.selected = false;
                });
            },



            /**
             *  Owners Filter in Now Queue
             * @param owners
             */
            setOwnersNowList: function (owners) {
                if (owners && owners.length > 0) {
                    //1. Set All Owners List
                    ownersNowList = owners.map(function (o) {
                        return {
                            _id: o._id, //User ID
                            name: o.fullName,
                            value: o.userName,
                            fname: o.firstName + ' ' + o.lastName,
                            selected: false
                        }
                    });

                    //2. Add default owner, which is current logged in user
                    var _userName = mvIdentity.currentUser.userName;
                    var currentOwner = _.find(ownersNowList, function (owner) {
                        return owner.value === _userName;
                    });
                    if (currentOwner) {
                        currentOwner.selected = true;
                        selectedOwnersNowList.push(currentOwner);
                    }
                }
                else {
                    ownersNowList = [];
                }
            },
            getOwnersNowList: function () {
                return ownersNowList;
            },
            addToSelectedOwnersNowList: function (owner) {
                selectedOwnersNowList.push(owner);
            },
            removeFromSelectedOwnersNowList: function (owner) {
                _.remove(selectedOwnersNowList, function (_owner) {
                    return _owner.name === owner.name && _owner.value === owner.value;
                });
            },
            getSelectedOwnerNowList: function () {
                return selectedOwnersNowList;
            },
            getSelectedOwnerIds: function () {
                var _ownerIds = _.pluck(selectedOwnersNowList, 'value');
                return _ownerIds;
            },
            resetOwnerNowList: function () {
                selectedOwnersNowList = [];
            },


            syncDropdown: function (filter) {
                this.forEach(function (o) {
                    if (o.value === filter.value) {
                        o.selected = false;
                    }
                });
            },

            updateSelectedList: function (filter) {
                var that = this;
                that.forEach(function (o, index) {
                    if (o.value === filter.value) {
                        that.splice(index, 1);
                    }
                });
            },

            resetList: function (selected) {
                this.forEach(function (o) {
                    o.selected = false;
                });
                if (selected) {
                    if (selected instanceof Array) {
                        selected.length = 0;
                    }
                    else {
                        selected = [];
                    }
                }
            }
        }
    }
]);
