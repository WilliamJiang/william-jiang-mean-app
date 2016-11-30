function CopyCoordinatorImportUCRCtrl($scope,
                                      $location,
                                      $log,
                                      mvIdentity,
                                      NotifierService,
                                      UploadService,
                                      APP_CONFIG) {

    'use strict';

    $scope.showUpload = true;
    $scope.showProgress = false;
    $scope.showComplete = false;

    var acceptTypes = {
	'.csv': 'text/csv',
	'.xls': 'application/vnd.ms-excel',
	'.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'.xlsb': 'application/vnd.ms-excel.sheet.binary.macroenabled.12',
	'.xlsm': 'application/vnd.ms-excel.sheet.macroenabled.12'
    }

    $scope.upload_file_drop_accept = _.values(acceptTypes).join(',');
    $scope.upload_file_select_accept = _.keys(acceptTypes).join(',');

    $scope.upload = {
        files: []
    };    

    $scope.$watch('upload.files',function () {
        $scope.onFileSelect($scope.upload.files);
    });

    function setUploadProgress(file,progress) {
        file.progress = progress;
    }

    function upload(file, idx) {

        $scope.showUpload = false;
        $scope.showProgress = true;
        $scope.showComplete = false;

        UploadService.upload(file,idx,{
            s3IngestURL: APP_CONFIG.S3_IMPORT_UCR_URL,
            policyURL: '/api/importUCRS3Policy',
            ingestURL: '/api/importUCR',
            onProgress: function onProgress(evt) {

                setUploadProgress(file,parseInt(100.0 * evt.loaded / evt.total));
            },
            onSuccess: function onSuccess(response) {

                file.postUploadMsg = response;

                setUploadProgress(file,100);

                $scope.response = response;

                $scope.showUpload = false;
                $scope.showProgress = false;
                $scope.showComplete = true;
            },
            onError: function onError(error) {

                setUploadProgress(file,100);

		console.log(error);
                NotifierService.notifyError('An error occurred while uploading.');
            }
        });
    }

    $scope.abort = function (index) {
        //$scope.upload[index].abort();
        //$scope.upload[index] = null;
    };

    $scope.onClickContinue = function () {
        $location.path('/cc/home/uninstructed');
    };

    $scope.onFileSelect = function (files) {

        if (!(files && files.length)) {
            return;
        }

        _.forEach(files, function (file, idx) {

            file.progress = parseInt(0);

            upload(file, idx);
        });
    };
}

angular.module('trafficbridge.cc')
    .controller('CopyCoordinatorImportUCRCtrl', [
        '$scope',
        '$location',
        '$log',
        'mvIdentity',
        'NotifierService',
        'UploadService',
        'APP_CONFIG',
        CopyCoordinatorImportUCRCtrl
    ]);
