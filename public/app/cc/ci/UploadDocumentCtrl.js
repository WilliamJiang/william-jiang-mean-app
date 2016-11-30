/**
 * Created by PavaniKa on 3/31/2015.
 */

function UploadDocumentCtrl($scope,
                            $modalInstance,
                            $upload,
                            $log,
                            mvIdentity,
                            NotifierService,
                            UploadService,
                            UtilsService,
                            APP_CONFIG) {

    $scope.ok = function () {
        $modalInstance.close($scope.uploadedCIId);
        //$scope.onClickContinue();
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.showUpload = true;
    $scope.showComplete = false;

    $scope.upload = {
        files: ''
    };

    function setUploadProgress(file, progress) {
        file.progress = progress;
        UtilsService.setProgressBarPercent('file_upload_progress', file.progress);
    }

    function upload(file, idx) {

        $scope.showUpload = false;
        $scope.showComplete = false;

        /**
         * Since use server-side proxy
         */
        UploadService.upload(file, idx, {
            s3IngestURL: APP_CONFIG.S3_INGEST_URL,
            policyURL: '/api/ingestS3Policy',
            ingestURL: '/api/media_company/manual_ingest',
            onProgress: function onProgress(evt) {

                setUploadProgress(file, parseInt(100.0 * evt.loaded / evt.total));
            },
            onSuccess: function onSuccess(response) {

                file.postUploadMsg = response;

                setUploadProgress(file, 100);

                // william: if ingest not succeeds, a notify should display
                if (response.ci_id) {
		    
                    $scope.uploadedCIId = response.ci_id;

                    $scope.showUpload = false;
                    $scope.showComplete = true;
                }
                else {

                    NotifierService.notifyError('An error occurred while uploading.');
                    $scope.cancel();
                }
            },
            onError: function onError(error) {

                setUploadProgress(file, 100);

		console.log(error);
                NotifierService.notifyError('An error occurred while uploading.');
            }
        });
    }

    $scope.abort = function (index) {
        $scope.upload[index].abort();
        $scope.upload[index] = null;
    };

    $scope.onClickContinue = function () {
        $location.path('/cc/metadata/' + $scope.uploadedCIId);
    };

    $scope.onFileSelect = function (files) {

        if (!(files && files.length)) {
            return;
        }

        //$scope.files = files;
        $scope.upload = [];

        _.forEach(files, function (file, idx) {

            setUploadProgress(file, 0);

            upload(file, idx);
        });
    };

    $scope.$watch('upload.files', function () {
        $scope.onFileSelect($scope.upload.files);
    });
}

angular.module('trafficbridge.cc').
    controller('UploadDocumentCtrl', [
        '$scope',
        '$modalInstance',
        '$location',
        '$log',
        'mvIdentity',
        'NotifierService',
        'UploadService',
        'UtilsService',
        'APP_CONFIG',
        UploadDocumentCtrl]);
