angular.module('myApp.requests', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/requests', {
    authenticate: true,
    templateUrl: 'view/requests/requests.html',
    controller: 'requestsPage',
    resolve: {
      getUserDemands: ['userRequests', function(userRequests) {
          return userRequests.getDemands();
      }],
      getUserRequests: ['userRequests', function(userRequests) {
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
  '$scope', 'getUserDemands', 'getUserRequests', 'getProfile', 'socket', 'Cookie', '$cookies', 'UserConnection', '$window', '$rootScope', '$location', '$timeout', 
  function($scope, getUserDemands, getUserRequests, getProfile, socket, Cookie, $cookies, UserConnection, $window, $rootScope, $location, $timeout) {

  // var userDemands = getUserDemands;
  // console.log('demands: ',userDemands);
  // var usersRequest = getUserRequests;
  // console.log('requests: ',usersRequest);
  var userInfos = getProfile;

  // Get User username
  var cookie = $cookies.get('gitConnectDeltaKS');
  var cookieObj = Cookie.parseCookie(cookie);
  var userUsername = cookieObj.username;

  $scope.usersRequest = getUserRequests;
  console.log($scope.usersRequest)
  $scope.userDemands = getUserDemands;
  console.log($scope.userDemands);

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


  $scope.requestAccept = function(requestedUserId, relId) {
    var userInfo = {
      acceptingUserId: userInfos.id,
      requestingUserId: requestedUserId,
      relId: relId
    }
    
    UserConnection.createConnection(userInfo).then(function() {
      socket.emit('notify:otherUser', {username: username, subject: 'showCollabPage', projectId: project.projectId})
      // $scope.linktoProject = project.projectId;
      // $('#projectPageRedirect').modal('show');
    });

  };

  $scope.deleteRequest = function(username) {
    console.log('Delete Request');
    var usersObject = {
      userFirst: userUsername,
      userSecond: username
    };
    
    UserConnection.deleteRequest(usersObject).then(function() {
      $('.requests.'+ username).slideUp();
    });
  };

  $scope.deleteDemand = function(username) {
    console.log('Delete Request');
    var usersObject = {
      userFirst: userUsername,
      userSecond: username
    };
    
    UserConnection.deleteDemand(usersObject).then(function() {
      $('.demands.'+username).slideUp();
    });
  };

  $scope.projectRedirect = function(id) {
    $('#projectPageRedirect').modal('hide');

    $timeout(function() {
      $rootScope.$broadcast('projectStarted', {projectId: id});
      socket.emit('notify:otherUser', {username: username, subject: 'showCollabPage', projectId: id})
    }, 1000);

    // window.location = '#/collaboration-page/' + id;
    // window.location.reload();
  }

}]);