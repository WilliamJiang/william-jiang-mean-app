function CopyCoordinatorCIHistoryCtrl($scope,
                                      $sce,
				      $log,
                                      ci,
                                      history) {

    $scope.ci = ci;
    $scope.history = history;

    function nameFromKey(key) {

        $log.debug('key[' + key + ']');

        if (!key) {
            return 'null';
        }

        var words = key.split('_');

        return _.map(words, function (word) {
            return _.capitalize(word.toLowerCase());
        }).join(' ');
    }

    var h = [];

    _.forEach($scope.history, function (item) {

        var text = '';

        _.forEach(_.sortBy(_.keys(item.diff)), function (k) {

            var v = item.diff[k];

            if (k === 'stapled') {
                text += 'A CI was added to the staple.<br/>';
            }
            else if (k === 'staple') {
                text += 'CI was stapled to another CI.<br/>';
            }
            else if (k === 'type' ||
                k === 'status') {

                text += '<b>' + nameFromKey(k) + '</b> was set to <b>' + nameFromKey(v) + '</b><br/>';
            }
            else if (k === 'air_date_start' ||
                k === 'air_date_end') {

                text += '<b>' + nameFromKey(k) + '</b> was set to <b>' + moment(v).format('MM/DD/YYYY') + '</b><br/>';
            }
            else if (k === 'archived') {
                text += 'CI was set to <b>archived</b>.';
            }
            //else if (k === 'possible_revision') {
            //}
            //else if (k === 'uninstructed_match') {
            //}
            //else if (k === 'stuck') {
            //}
            else if (k === 'updated_at' ||
                k === 'created_at' ||
                k === 'files' ||
                k === 'ingest') {
                angular.noop();
                // ignore, otherwise will throw warnings.
            }
            else {
                text += '<b>' + nameFromKey(k) + '</b> was set to <b>' + v + '</b><br/>';
            }
        });

        h.push({
            text: $sce.trustAsHtml(text),
            timestamp: moment(item.timestamp).format('dddd, MMMM Do YYYY, h:mm:ss a')
        });
    });

    $scope.parsed_history = h;
}

angular
    .module('trafficbridge.cc')
    .controller('CopyCoordinatorCIHistoryCtrl', [
        '$scope',
        '$sce',
	'$log',
        'ci',
        'history',
        CopyCoordinatorCIHistoryCtrl
    ]);
