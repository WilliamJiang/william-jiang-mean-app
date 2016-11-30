function TrafficCoordinatorAddCICtrl($scope,
                                     $http,
                                     $location,
                                     $upload,
				     $log,
                                     mvIdentity,
                                     DataService,
                                     NotifierService,
                                     media_companies,
                                     APP_CONFIG) {
    'use strict';

    $scope.showUpload = true;
    $scope.showProgress = false;
    $scope.showComplete = false;

    $scope.current = 0;
    $scope.max = 100;
    $scope.uploadCurrent =  0;
    $scope.stroke = 15;
    $scope.radius = 60;
    $scope.isSemi = false;
    $scope.rounded = false;
    $scope.currentColor = '#45ccce';
    $scope.bgColor = '#eaeaea';
    $scope.iterations = 50;
    $scope.currentAnimation = 'easeOutCubic';

    $scope.$watch('files',function() {
        $scope.onFileSelect($scope.files);
    });

    ////

    $scope.networks = [];

    $scope.networks = _.sortBy(_.flatten(_.map(media_companies,function(media_company) {
        return media_company.networks;
    })),function(network) { return network.name.toUpperCase(); });

    $scope.cancelButtonLocation = /*$rootScope.returnTo ||*/'/tc/home/now';

    $scope.selectedNetwork = $scope.networks[0];

    $scope.onChangeNetwork = function() {

        $scope.media_company_for_network = networkToMediaCompanyMap[$scope.selectedNetwork._id];
        //$scope.advertiserAutoCompleteEnabled = true;
        //debugger;
    }

    ////

    var networkToMediaCompanyMap = {};

    _.forEach(media_companies,function(media_company) {

        _.forEach(media_company.networks,function(network) {
            networkToMediaCompanyMap[network._id] = media_company;
        });
    });

    ////

    $scope.types = DataService.CI.getTypesForSelect(mvIdentity.currentUser.affiliation.ref_id);

    ////

    //$scope.advertiserAutoCompleteEnabled = false;

    ////

    $scope.getAdvertisers = function(search) {

        return DataService
            .Advertisers
            .getMatches(search)
            .then(function(response) {

                return response.results.advertisers;
            });
    }

    $scope.onChangeAdvertiser = function() {

        $scope.files_by_brand = false;
        $scope.files_by_program = false;
        $scope.selectedType = DataService.MediaCompanies.getDefaultCIType();
    }

    $scope.onSelectAdvertiser = function(item,model,label) {

        $scope.files_by_brand = item.files_by_brand;
	
        if (item.files_by_program) {

            DataService
                .MediaCompanies
                .getProgramsForNetwork(mvIdentity.currentUser.affiliation.ref_id,
                                       mvIdentity.currentUser.affiliation.metadata.active_network)
                .then(function(programs) {

                    $scope.programs = programs;
                    $scope.files_by_program = item.files_by_program;
                });
        }
        $scope.brands = item.brands;
        if (item.default_ci_type) {
            $scope.selectedType = item.default_ci_type;
        }
    };

    $scope.onChangeBrand = function() {
    }

    $scope.onChangeProgram = function() {
    }

    ////

    function upload(file,idx) {

        $scope.showUpload = false;
        $scope.showProgress = true;
        $scope.showComplete = false;

        var metadata = {
            network: $scope.selectedNetwork.name,
            advertiser: $scope.advertiser,
            brand: $scope.selectedBrand,
            program: $scope.selectedProgram,
            type: $scope.selectedType,
            air_date_start: $scope.air_date_start,
            air_date_end: $scope.air_date_end
        };

        //debugger;

        $http
            .get('/api/ingestS3Policy?mimeType='+ file.type)
            .success(function(response) {

                var s3Params = response;

                $scope.upload[idx] = $upload.upload({
                    url: APP_CONFIG.S3_INGEST_URL,
                    method: 'POST',
                    fields : {
                        key: '' + Math.round(Math.random() * 10000) + '$$' + file.name,
                        AWSAccessKeyId: s3Params.AWSAccessKeyId,
                        acl: 'public-read',
                        "Content-Type": file.type,
                        policy: s3Params.s3Policy,
                        signature: s3Params.s3Signature,
                        success_action_status : '201'
                    },
                    file: file
                });

                $scope
                    .upload[idx]
                    .success(function(xml,status,headers,config) {

                        file.progress = parseInt(100);

                        if (status === 201) {

                            var data = xml2json.parser(xml);

                            var parsedData = {
                                mimeType: file.ext, // not original field
                                location: data.postresponse.location,
                                bucket: data.postresponse.bucket,
                                key: data.postresponse.key,
                                name: file.name,				
                                etag: data.postresponse.etag, // not passed
				metadata: metadata
                            };

                            //$scope.imageUploads.push(parsedData);
                            //$scope.parsedData = parsedData;

                            file.ext = file.name.split('.').pop();

                            $http
                                .post('/api/agency/manual_ingest',parsedData)
                                .success(function(response) {

                                    file.postUploadMsg = response;

                                    $scope.uploaded_ci_id = response.ci_id;

                                    $scope.showUpload = false;
                                    $scope.showProgress = true;
                                    $scope.showComplete = true;
                                })
                                .error(function(err) {
                                    NotifierService.notifyError('An error occurred while uploading. ' + err);
                                });
                        }
                        else {
                            NotifierService.notifyError('An error occurred while uploading.');
                        }
                    })
                    .progress(function(evt) {
                        file.progress =  parseInt(100.0 * evt.loaded / evt.total);
                    })
                    .error(function(err) {
                        NotifierService.notifyError('An error occurred while uploading. ' + err);
                    });
            });
    }

    //$scope.imageUploads = [];

    $scope.abort = function(index) {
        $scope.upload[index].abort();
        $scope.upload[index] = null;
    };

    $scope.onFileSelect = function(files) {

        if (!(files && files.length)) {
            return;
        }

        //$scope.files = files;
        $scope.upload = [];

        _.forEach(files,function(file,idx) {

            file.progress = parseInt(0);

            upload(file,idx);
        });
    };

    $scope.open = function($event,opened) {

        $event.preventDefault();
        $event.stopPropagation();

        $scope[opened] = !$scope[opened];

        //close the other when one is opening!
        var otherDateFlag = (opened == 'opened_air_date_start' ? 'opened_air_date_end' : 'opened_air_date_start');
        $scope[otherDateFlag] = false;
    };

    $scope.dateOptions = {
        formatYear: 'yyyy',
        startingDay: 1
    };

    $scope.format = 'MM/dd/yyyy';

    //Date Range Dropdown
    $scope.SelectDateRange = function ($event, rangeType) {
        $log.debug(rangeType);
    }    
}

angular.module('trafficbridge.cc')
    .controller('TrafficCoordinatorAddCICtrl',[
        '$scope',
        '$http',
        '$location',
        '$upload',
	'$log',
        'mvIdentity',
        'DataService',
        'NotifierService',
        'media_companies',
        'APP_CONFIG',
        TrafficCoordinatorAddCICtrl
    ]);
