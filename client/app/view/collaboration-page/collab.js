angular.module('myApp.collaboration-page', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/collaboration-page', {
    authenticate: true,
    templateUrl: 'view/collaboration-page/collab.html',
    controller: 'collaboration-page',
  });
}])

.controller('collaboration-page', ['$scope', function($scope) {

}]);