function CICountsPollerService(poller,
                               Restangular,
                               FilterService) {

    return {

        create: function () {
            //return poller.get(Restangular.one('ci/counted'), { action: 'get' });

            var _owners = FilterService.getSelectedOwnerIds();
            return poller.get(Restangular.one('ci/counts'), {
                action: 'customPOST',
		delay: 3000,
		smart: true,
                argumentsArray: [_owners]
            });
        }
    }
}

angular
    .module('app')
    .factory('CICountsPollerService', [
        'poller',
        'Restangular',
        'FilterService',
        CICountsPollerService
    ]);
