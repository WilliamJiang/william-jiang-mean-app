angular
    .module('tbFilters', [
        'tbFilters.page-offset'
    ]);

angular
    .module('tbFilters.page-offset', [])
    .filter('pageOffset', [function () {
        return function (input, start, pageSize) {
            //0 based index
            var _start = (parseInt(start, 10) - 1);
            var _end = _start + 1;
            var _pageSize = parseInt(pageSize, 10);

            //console.log('$$$$$ offset: ' + _start + ', ' + _end + ', ' + _pageSize + ', ' + input.length);
            return input.slice((_start * _pageSize), (_end * _pageSize));
        };
    }]);
