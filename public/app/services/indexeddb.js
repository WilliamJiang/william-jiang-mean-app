/**
 * William: This file is deprecated, it is an alternative option for bulky data storage and search.
 * This file is not used anywhere, just a reference for performance comparison. You can delete it anytime.
 * (1) It saves advertisers (1507) locally in HTML5 indexedDB,
 *     and try to provide a faster search/filter solution instead of flat string arrays indexOf() search.
 *     It works, with the similar performance with indexOf() or re.test().
 * (2) Besides, bootstrap Typeahead is also an option, but same performance also.
 * (3) To make thing easier, use array.indexOf() as solution.
 */
var tbcc = angular.module('app');

tbcc.factory('indexedDBDataSvc', [
    '$window', '$q',
    function ($window, $q) {
    var indexedDB = $window.indexedDB;
    var db = null;

    var open = function () {
        var deferred = $q.defer();
        var version = 1;
        var request = indexedDB.open("advertisersDB", version);

        request.onupgradeneeded = function (e) {
            db = e.target.result;

            e.target.transaction.onerror = indexedDB.onerror;

            if (db.objectStoreNames.contains("advertiser")) {
                db.deleteObjectStore("advertiser");
            }

            var store = db.createObjectStore("advertiser",
                {keyPath: "id", autoIncrement: true});

            store.createIndex('name1_idx', 'name1', {unique: true});
            store.createIndex('name2_idx', 'name2', {unique: true});
        };

        request.onsuccess = function (e) {
            db = e.target.result;
            deferred.resolve();
        };

        request.onerror = function () {
            deferred.reject();
        };

        return deferred.promise;
    };

    var getSearchAdvertisers = function (searchTerm) {

        var deferred = $q.defer();

        if (db === null) {
            deferred.reject("IndexDB is not opened yet!");
        }
        else {
            var trans = db.transaction(["advertiser"], "readonly");
            var store = trans.objectStore("advertiser");
            var myIndex = store.index('name1_idx');
            var list = [];

            myIndex.openKeyCursor().onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                    if (cursor.key.indexOf(searchTerm) >= 0) {
                        list.push(cursor.key);
                    }
                    cursor.continue();
                }
                else {
                    //console.log('done.');
                    deferred.resolve(list);
                }
            };

            /**
             var keyRange = IDBKeyRange.bound(searchTerm, searchTerm + '\uffff');
             //var keyRange = IDBKeyRange.lowerBound(0);
             var request = store.openCursor(keyRange, 'prev');

             request.onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor === null || cursor === undefined)
                    deferred.resolve(list);
                else {
                    list.push(cursor.value);
                    cursor.continue();
                }
                //console.log('22222', cursor);
                //if (cursor.value.name.substr(0, searchTerm.length) == searchTerm) {
                //    console.log('processing here');
                //} else {
                //    cursor.continue();
                //}
            };

             request.onerror = function (e) {
                console.log('33333333', e);
                deferred.reject("Something went wrong!!!");
            };
             */
        }

        return deferred.promise;
    };

    var getAdvertisers = function () {

        var deferred = $q.defer();

        if (db === null) {
            deferred.reject("IndexDB is not opened yet!");
        }
        else {
            var trans = db.transaction(["advertiser"], "readonly");
            var store = trans.objectStore("advertiser");
            var advertisers = [];

            // Get everything in the store;
            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange, 'prev');

            cursorRequest.onsuccess = function (e) {

                var result = e.target.result;
                if (result === null || result === undefined) {
                    deferred.resolve(advertisers);
                }
                else {
                    advertisers.push(result.value);

                    result.continue();
                }
            };

            cursorRequest.onerror = function (e) {
                console.log('4444', e.value);
                deferred.reject("Something went wrong!!!");
            };
        }

        return deferred.promise;
    };

    var deleteAdvertiser = function (id) {
        var deferred = $q.defer();

        if (db === null) {
            deferred.reject("IndexDB is not opened yet!");
        }
        else {
            var trans = db.transaction(["advertiser"], "readwrite");
            var store = trans.objectStore("advertiser");

            var request = store.delete(id);

            request.onsuccess = function (e) {
                deferred.resolve();
            };

            request.onerror = function (e) {
                console.log(e.value);
                deferred.reject("Advertiser item couldn't be deleted");
            };
        }

        return deferred.promise;
    };

    var addAdvertiser = function (advertisers) {

        var deferred = $q.defer();

        if (db === null) {
            deferred.reject("IndexDB is not opened yet!");
        }
        else {
            var trans = db.transaction(["advertiser"], "readwrite");
            var store = trans.objectStore("advertiser");

            angular.forEach(advertisers, function (a, index) {

                var request = store.put({
                    name1: a.advertiser.toUpperCase(),
                    name2: angular.filterWord(a.advertiser)
                });

                request.onsuccess = function (e) {
                    deferred.resolve();
                };

                request.onerror = function (e) {
                    console.log(e.value);
                    deferred.reject("Advertiser item couldn't be added!");
                };
            });
        }
        return deferred.promise;
    };

    return {
        open: open,
        getAdvertisers: getAdvertisers,
        getSearchAdvertisers: getSearchAdvertisers,
        addAdvertiser: addAdvertiser,
        deleteAdvertiser: deleteAdvertiser
    };

}]);

// william HISTORY:
/**
 * https://github.com/webcss/angular-indexedDB: hard to use, lack of document, GIVE UP.
 *
 tbcc.config(function ($indexedDBProvider) {
    $indexedDBProvider
        .connection('advertiserDB')
        .upgradeDatabase(1, function (event, db, tx) {
            var objStore = db.createObjectStore('advertiser', {keyPath: 'id', autoIncrement: true});
            objStore.createIndex('name1_idx', 'name1', {unique: true});
            objStore.createIndex('name2_idx', 'name2', {unique: true});
        });
});
 tbcc.controller('advertiserController', function ($scope, $indexedDB) {
    $scope.objects = [];
    var OBJECT_STORE_NAME = 'advertiser';
    var myObjectStore = $indexedDB.objectStore(OBJECT_STORE_NAME);
    myObjectStore.insert($scope.advertisersList).then(function (e) {});

    myObjectStore.getAll().then(function (results) {
        // Update scope
        $scope.objects = results;
    });

    var myQuery = $indexedDB.queryBuilder().$index('age_idx').$gt(40).$asc.compile();
    myObjectStore.each(myQuery).then(function (cursor) {
        cursor.key;
        cursor.value;
    });
});
 */

/**
 * in CopyCoordinatorLibraryCtrl.js:
 //FilterService.setFullAdvertisersList(advertisers);
 //indexedDBDataSvc.open().then(function () {
    //    indexedDBDataSvc.addAdvertiser(advertisers).then(function () {
    //        console.log('Successfully');
    //    }, function (err) {
    //        console.log(err);
    //    });
    //});

 var myObjectStore = $indexedDB.objectStore('advertiser');
 angular.forEach(advertisers, function (a, key) {
                    myObjectStore.insert({
                        "id": lastIndex,
                        name1: a.advertiser.toUpperCase(),
                        name2: angular.filterWord(a.advertiser)
                    }).then(function (e) {
                        console.log('error', e);
                    });
                });
 */