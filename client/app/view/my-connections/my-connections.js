angular.module('myApp.myConnections', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/my-connections', {
    authenticate: true,
    templateUrl: 'view/my-connections/my-connections.html',
    controller: 'myConnections',
    resolve: {
      getProfile: ['$route', 'User', 'Cookie', '$cookies', function($route, User, Cookie, $cookies) {
        var cookie = $cookies.get('gitConnectDeltaKS');
        var cookieObj = Cookie.parseCookie(cookie);
        // return User.getProfile(cookieObj.username);
        return User.getProfileAndRelations(cookieObj.username);
      }]
    }
  });
}])

.controller('myConnections', [
  '$scope', 'getProfile', 'socket', 'Cookie', '$cookies', 'UserConnection', '$window', '$rootScope', '$location', 
  function($scope, getProfile, socket, Cookie, $cookies, UserConnection, $window, $rootScope, $location) {
    
  $scope.user = getProfile;
  console.log($scope.user)

  $scope.connections = $scope.user.relationships.CONNECTED;
  console.log('asdasdsad',$scope.connections)

}]);