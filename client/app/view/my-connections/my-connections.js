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

  $scope.connections = $scope.user.relationships.CONNECTED;

  $scope.ratings = function(ratings, index, type) {
    ratings = Math.round(ratings);
    // Ratings Module
    index = index + 2;
    $ratings = $('.user-details.' + type + ':nth-child(' + index + ') .stars');
    for (var pos = 0; pos < 5; pos++) {
      $ratings.append("<i class='fa fa-star-o position-" + pos + "'></i>");
    }
    for (var i = 0; i < ratings; i++) {
      $('.user-details.' + type + ':nth-child(' + index + ') .position-' + i).removeClass('fa-star-o').addClass('fa-star');
    }
  };

}]);