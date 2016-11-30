/* jshint -W075 */
/**
 * Created by PavaniKa on 5/04/2015.
 */

function UnstapleReasonCtrl($scope,
                            $modalInstance,
                            $log,
                            DataService,
                            UtilsService,
                            NotifierService,
                            payload) {

    $scope.payload = {
        sourceId: payload.sourceId,
        sourceStatus: payload.sourceStatus,
        targetId: payload.targetId,
        reason: ''
    };

    $scope.OKbuttonClicked = false;

    $scope.ok = function (form) {
        //prevent double clicks!
        $scope.OKbuttonClicked = true;

        DataService
            .CI
            .unstapleVersion($scope.payload)
            .then(function (data) {
                NotifierService.notifySuccess('Version unstapled successfully.');

                $modalInstance.close(data);

            }, function (error) {
                $log.debug(error);
                $scope.OKbuttonClicked = false;
                NotifierService.notifyError(error.data.reason);
            });

    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

angular.module('trafficbridge.cc').
    controller('UnstapleReasonCtrl', [
        '$scope',
        '$modalInstance',
        '$log',
        'DataService',
        'UtilsService',
        'NotifierService',
        'payload',
        UnstapleReasonCtrl
    ]);
