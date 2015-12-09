angular.module('myApp.howToUse', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/how-to-use', {
  	authenticate: false,
    templateUrl: 'view/how-to-use-page/how-to.html',
    controller: 'howToUseController'
  });
}])

.controller('howToUseController', ['$scope', function($scope) {

  // Set default min height regarding screen height
  $('.page').css('min-height', window.innerHeight - 40 + 'px');

}]);