function LoginCtrl($scope,
                   $rootScope,
                   mvIdentity,
                   NotifierService,
                   ADMIN_CONFIG,
                   AuthService,
                   $location,
                   $state) {

    $scope.signin = function (username, password) {

        AuthService.authenticateUser(username, password)
            .then(function (response) {

                //var url = $location.protocol() + '://' + $location.host() + ':3000';

                if (response.data.success) {

                    var role = mvIdentity.currentUser.roles.filter(function (r) {
                        return /admin/i.test(r);
                    })[0];

                    var adminRoles = ADMIN_CONFIG.USER.ADMIN_ROLES;
                    var userName = mvIdentity.currentUser.firstName + ' ' + mvIdentity.currentUser.lastName;

                    //TODO: !!show/hide tabs based on User role (security)!!
                    if (role === adminRoles.TB_ADMIN.value) {
                    }
                    else if (role === adminRoles.SUPER_ADMIN.value) {
                    }
                    else if (role === adminRoles.COMPANY_ADMIN.value) {
                    }

                    var affiliation = {}, groups = {};
                    if (response.data.user) {
                        if (response.data.user.affiliation) {
                            affiliation = response.data.user.affiliation;
                        }
                        if (response.data.user.groups) {
                            groups = response.data.user.groups;
                        }
                    }
                    mvIdentity.setUser({
                        name: userName,
                        role: role,
                        affiliation: affiliation,
                        groups: groups
                    });

                    NotifierService.notifySuccess('Welcome, ' + role + ', ' + userName);

                    //$rootScope.$emit('login-display');
                    //$rootScope.$broadcast('login-display');
                    $location.path('/admin'); //load the tabs for now!
                    //$state.go('admin');
                }
                else {

                    NotifierService.notifyError(response.data.message || 'Unauthorized User, please try others.');
                }
            })
            .catch(function (error) {
                NotifierService.notifyError('Error: ' + error.toString());
            });
    };
}

angular
    .module('trafficbridge.admin.login')
    .controller('LoginCtrl', [
        '$scope',
        '$rootScope',
        'mvIdentity',
        'NotifierService',
        'ADMIN_CONFIG',
        'AuthService',
        '$location',
        '$state',
        LoginCtrl
    ]);

