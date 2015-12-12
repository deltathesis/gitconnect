angular.module('myApp.requests', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/requests', {
    authenticate: true,
    templateUrl: 'view/requests/requests.html',
    controller: 'requestsPage',
    resolve: {
      sentRequests: ['userRequests', function(userRequests) {
        //getUserDemands cypher: MATCH ({username: "'+username+'"})-[r:CONNECTION_REQUEST]->(n)
          return userRequests.getDemands();
      }],
      recievedRequests: ['userRequests', function(userRequests) {
        //getUserRequests: 'MATCH ({username: "'+username+'"})<-[r:CONNECTION_REQUEST]-(n)'
          return userRequests.getRequests();
      }],
      getProfile: ['$route', 'User', 'Cookie', '$cookies', function($route, User, Cookie, $cookies) {
        var cookie = $cookies.get('gitConnectDeltaKS');
        var cookieObj = Cookie.parseCookie(cookie);
        // return User.getProfile(cookieObj.username);
        return User.getProfileAndRelations(cookieObj.username);
      }]
    }
  });
}])

.controller('requestsPage', [
  '$scope', 'recievedRequests', 'sentRequests', 'getProfile', 'socket', 'Cookie', '$cookies', 'UserConnection', '$window', '$rootScope', '$location', '$timeout', 
  function($scope, recievedRequests, sentRequests, getProfile, socket, Cookie, $cookies, UserConnection, $window, $rootScope, $location, $timeout) {
    
  var userInfos = getProfile;

  // Get User username
  var cookie = $cookies.get('gitConnectDeltaKS');
  var cookieObj = Cookie.parseCookie(cookie);
  var userUsername = cookieObj.username;

  $scope.sentRequests = sentRequests;
  $scope.recievedRequests = recievedRequests;
  console.log($scope.sentRequests)
  console.log($scope.recievedRequests)

  // Set default min height regarding screen height
  $('.page').css('min-height', window.innerHeight - 40 + 'px');

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


  $scope.requestAccept = function(requestedUserId, relId, username) {
    var userInfo = {
      acceptingUserId: userInfos.id,
      requestingUserId: requestedUserId,
      relId: relId
    }
    
    UserConnection.createConnection(userInfo).then(function() {
      $('.requests.'+ username).slideUp();
      socket.emit('notify:otherUser', {username: username, subject: 'myConnections'});
      socket.emit('store:otherUser', {username: username});
    });

  };

  $scope.deleteReceivedRequest = function(username) {
    var usersObject = {
      userFirst: userUsername,
      userSecond: username
    };
    
    UserConnection.deleteRequest(usersObject).then(function() {
      $('.requests.'+ username).slideUp(); 
    });
  };

  $scope.deleteSentRequest = function(username) {
    var usersObject = {
      userFirst: userUsername,
      userSecond: username
    };
    
    UserConnection.deleteDemand(usersObject).then(function() {
      $('.demands.'+username).slideUp();
    });
  };

}]);