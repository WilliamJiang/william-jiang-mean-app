function CIPollerService(poller,
                         Restangular,
                         FilterService) {

    return {
        create: function (filter) {

            /*var ciPoller = poller
             .get(Restangular
             .all('ci/' + filter),
             {
             action: 'getList'
             });*/

            var _owners = FilterService.getSelectedOwnerIds();
            var args = {
                queue: filter,
                owners: _owners
            };

            var ciPoller = poller.get(Restangular.all('ci/' + filter), {
                action: 'customPOST',
		delay: 3000,
		smart: true,		
                argumentsArray: [args]
            });

            return ciPoller;
        }
    }
}

angular
    .module('app')
    .factory('CIPollerService', [
        'poller',
        'Restangular',
        'FilterService',
        CIPollerService
    ]);
