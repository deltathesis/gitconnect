angular.module('myApp.team', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/team', {
  	authenticate: false,
    templateUrl: 'view/team-page/team.html',
    controller: 'teamCtrl'
  });
}])

.controller('teamCtrl', ['$scope', function($scope) {

}]);