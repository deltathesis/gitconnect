angular.module('myApp.auth', [])

.controller('AuthController', ['$scope', '$http', 'Auth', '$cookies', 'Cookie', function($scope, $http, Auth, $cookies, Cookie) {

	// Setup cookies for github user connexion information
  $scope.githubCookie = false;
  var cookie = $cookies.get('gitConnectDeltaKS');

  if (cookie) {
  	// Create user object for cookie information
    var cookieObj = Cookie.parseCookie(cookie);
    var user = {
      // 'githubUserId' : githubCookie.fbId,
      'githubUserName' : cookieObj.username,
      'avatar_url' : cookieObj.avatar
    }
    $scope.user = user;
    $scope.githubCookie = true;
  }

}]);