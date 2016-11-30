(function () {
    "use strict";

    describe("trafficbridge.cc: ", function () {

        function appConfigProvider() {
            this.$get = function () {
                return {
                    COMPANY: {
                        TYPE: {
                            AGENCY: 'agency',
                            MEDIA_COMPANY: 'media_company'
                        }
                    },
                    INGEST: {
                        METHOD: {
                            MANUAL: 'manual',
                            EMAIL: 'email',
                            SYSTEM: 'system'
                        },
                        SOURCE: {
                            TRAFFICBRIDGE: 'bridge'
                        },
                        FILE_TYPE: {
                            PDF: 'pdf'
                        }
                    },
                    CI: {
                        STATUS: {
                            //ALL: 'all_statuses',
                            DELIVERED: 'delivered',
                            IN_PROGRESS: 'in_progress',
                            COMPLETED: 'completed',
                            IGNORED: 'ignored',
                            EMAILS: 'emails'
                        },
                        TYPE: {
                            //ALL:
                            //'all_types',
                            NATIONAL: 'national',
                            DIRECT_RESPONSE: 'direct_response',
                            PAID_PROGRAMMING: 'paid_programming',
                            BARTER: 'barter'
                        },
                        CONDITION: {
                            //ALL:
                            //'all_conditions',
                            REVISION: 'revision',
                            STUCK: 'stuck',
                            MATCH: 'match'
                        }
                    },
                    USER: {
                        ROLES: {
                            MEDIA_COMPANY: {
                                ADMIN: 'media_company.admin',
                                SUPERVISOR: 'media_company.supervisor',
                                USER: 'media_company.user'
                            },
                            AGENCY: {
                                ADMIN: 'agency.admin',
                                SUPERVISOR: 'agency.supervisor',
                                USER: 'agency.user'
                            }
                        }
                    },
                    APP_URL: 'http://trafficbridge-prod.elasticbeanstalk.com',
                    S3_INGEST_URL: 'https://manual-ingestion-uploads.s3.amazonaws.com/',
                    S3_IMPORT_UCR_URL: 'https://trafficbridge-importucr-dev.s3.amazonaws.com/'
                }
            };
        }

        function ciProvider() {
            this.$get = function () {
                return {
                    network: "MC0Network0",
                    ingest: {
                        files: {
                            original: {file_type: '_INGEST.FILE_TYPE.PDF', url: 'locationHTML'},
                            common: {file_type: '', url: 'location'}
                        }
                    },
                    status: '_CI.STATUS.EMAILS',
                    created_by: '',
                    // Compatibility
                    method: '_INGEST.METHOD.EMAIL',
                    source: 'sFrom',
                    files: {
                        original: {
                            filename: 'htmlFileName',
                            file_type: 'ingestEmail.files.original.file_type',
                            url: 'locationHTML'
                        },
                        common: {filename: 'filename', file_type: 'ingestEmail.files.common.file_type', url: 'location'}
                    }
                };
            };
        }

        angular.module('app')
            .provider('APP_CONFIG', appConfigProvider);

        angular.module('app')
            .provider('ci', ciProvider);

        var $controller, id = 0;

        beforeEach(module("app"));
        beforeEach(module("trafficbridge.cc"));
        beforeEach(module(function ($provide) {
        }));

        beforeEach(inject(function (_$controller_) {
            $controller = _$controller_;
        }));

        describe("CopyCoordinatorCIViewCtrl", function () {
            it("should have initial values.", function () {
                var $scope = {};
                var controller = $controller('CopyCoordinatorCIViewCtrl', {
                    $scope: $scope,
                    $routeParams: id,
                    'parkinglot': CopyCoordinatorParkingLotCtrl
                });

                expect($scope.editNoteMode).toBeFalsy();
                expect($scope.isInParkingLot).toBeDefined();
                // will failure:
                // expect($scope.editNoteMode).toBeTruthy();
                // expect($scope.isInParkingLot).toBeUndefined();
            })
        });
    });
}).call(this);
