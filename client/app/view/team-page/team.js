angular.module('myApp.team', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/team', {
  	authenticate: false,
    templateUrl: 'view/team-page/team.html',
    controller: 'teamCtrl'
  });
}])

.controller('teamCtrl', ['$scope', function($scope) {

  // Set default min height regarding screen height
  $('.page').css('min-height', window.innerHeight - 40 + 'px');

}]);