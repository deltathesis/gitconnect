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

.controller('publishMessaging', ['$scope', '$uibModal', 'theUser', '$uibModalInstance', 'currentUser', 'socket', function($scope, $uibModal, theUser, $uibModalInstance, currentUser, socket) {
  $scope.theUser = theUser;
   /** Socket Message Sending **/

  $scope.sendMessage = function(targetUser) {
    socket.emit('store:firstMessageData', {
      message: {
        text: $scope.message,
        user: currentUser
      },
      user: currentUser,
      target: theUser,
      room: currentUser + theUser
    });
    console.log('theUser', theUser);
    console.log('currentUser ', currentUser);
    socket.emit('notify:otherUser', {
      username: theUser,
      subject: 'messages'
    })
    socket.emit('notify:message', {
      target: theUser,
      currentUser: currentUser
    })
    $uibModalInstance.close();
  }
  socket.on('send:foundRoom', function(data) {
    socket.emit('send:privateMessage', {
      message: $scope.message,
      room: data.room
    });
    $scope.message = '';
  })

  $scope.close = function() {
    $uibModalInstance.close();
  }
  
}])

.controller('myConnections', [
  '$scope', 'getProfile', 'socket', '$uibModal', 'Cookie', '$cookies', 'UserConnection', '$window', '$rootScope', '$location', 'User',
  function($scope, getProfile, socket, $uibModal, Cookie, $cookies, UserConnection, $window, $rootScope, $location, User) {
    
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

  $scope.removeConnection = function (user) {
    User.removeConnection($scope.user.id, user.id)
      .then(function() {
        $('.' + user.username).slideUp();
      });
  };

  $scope.sendMessageButton = function(target){
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'view/my-connections/messageModal.html',
      controller: 'publishMessaging',
      size: 'md',
      resolve: {
        theUser: function(){
          return target
        },
        currentUser: function(){
          return $scope.user.username
        }
      }
    })
  }

}]);