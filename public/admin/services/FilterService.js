var tbcc = angular.module('tbadmin');

tbcc.factory('FilterService', [
    "mvIdentity",
    function (mvIdentity) {
        "use strict";

        var advertisersList = [];
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
                        return f.value === brands[i];
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
             *  Owners Filter in Now Queue
             * @param owners
             */
            setOwnersNowList: function (owners) {
                if (owners && owners.length > 0) {
                    //1. Set All Owners List
                    ownersNowList = owners.map(function (o) {
                        return {
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