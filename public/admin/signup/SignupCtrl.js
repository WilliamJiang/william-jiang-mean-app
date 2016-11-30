function SignupCtrl($scope,
                    $location,
                    DataService,
                    AuthService,
                    NotifierService) {

    $scope.allowCompanySelection = false;
    $scope.affiliation = {};

    $scope.signup = function () {

        var newUser = {
            userName: $scope.email,
            password: $scope.password,
            firstName: $scope.fname,
            lastName: $scope.lname,
            affiliation: $scope.affiliation
        };

        AuthService
            .createUser(newUser)
            .then(function () {
                NotifierService.notifySuccess('New User created!');
                $location.path('/');
            },
            function (reason) {
                NotifierService.notifyError(reason);
            });
    };

    $scope.onChangeAffiliationType = function () {

        DataService
            .Companies
            .getAllByAffiliationType($scope.affiliation.type)
            .then(function (companies) {

                //reset the select
                $scope.selectedCompany = null;
                $scope.allowCompanySelection = true;

                $scope.selectedNetwork = null;
                $scope.allowNetworkSelection = false;

                $scope.affiliation.metadata = null;

                $scope.companies = {};

                _.forEach(companies, function (company) {
                    $scope.companies[company._id] = company;
                });

                $scope.company_dropdown = _.map(companies, function (company) {
                    return {name: company.name, value: company._id};
                });

                if ($scope.company_dropdown.length > 0) {
                    $scope.affiliation.ref_id = $scope.company_dropdown[0].value;
                }
            });
    };

    $scope.onChangeCompany = function () {

        $scope.affiliation.ref_id = $scope.selectedCompany.value;

        if ($scope.affiliation.type === 'media_company') {

            var networks = $scope.companies[$scope.selectedCompany.value].networks;

            $scope.network_dropdown = _.map(networks, function (network) {
                return {name: network.name, value: network._id};
            });

            if ($scope.network_dropdown.length > 0) {

                $scope.affiliation.metadata = {
                    active_network: $scope.company_dropdown[0].name
                }
            }

            $scope.allowNetworkSelection = true;
        }
    };

    $scope.onChangeNetwork = function () {

        $scope.affiliation.metadata = {
            active_network: $scope.selectedNetwork.name
        }
    }
}

angular
    .module('trafficbridge.admin.signup')
    .controller('SignupCtrl', [
        '$scope',
        '$location',
        'DataService',
        'AuthService',
        'NotifierService',
        SignupCtrl
    ]);
