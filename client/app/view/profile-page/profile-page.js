angular.module('myApp.profilepage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/profile', {
    authenticate: true,
    templateUrl: 'view/profile-page/profile-page.html',
    controller: 'profilePage',
  });
}])

.controller('profilePage', ['$scope', function($scope) {

}]);