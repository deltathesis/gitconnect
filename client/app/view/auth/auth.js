angular.module('myApp.auth', [])

.controller('AuthController', ['$scope', '$http', 'Auth', '$cookies', function($scope, $http, Auth, $cookies) {

	// Setup cookies for github user connexion information
  $scope.githubCookie = false;
  var githubCookie = $cookies.get('github');  // get cookie from github
  var avatar = $cookies.get('github.avatar');

  if (githubCookie) {
  	// Create user object for cookie information
    var user = {
      // 'githubUserId' : githubCookie.fbId,
      'githubUserName' : githubCookie,
      'avatar_url' : avatar
    }
    $scope.user = user;
    $scope.githubCookie = true;
  }

}]);