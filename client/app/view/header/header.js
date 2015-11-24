angular.module('myApp.header', [])

.controller('headerController', ['$scope', 'socket', '$cookies', 'Cookie', '$log', function($scope, socket, $cookies, Cookie, $log) {
  var cookie = $cookies.get('gitConnectDeltaKS');
  if(cookie){

    var cookieObj = Cookie.parseCookie(cookie);
    $log.warn('username on cookie', cookieObj.username);

    $scope.username = cookieObj.username;
    
    socket.emit('giveMeDATA', {username: cookieObj.username});

    socket.on('theDATA', function(data){
      $scope.unreadMessages = data.messageNotifications;
      $scope.friendRequests = data.friendRequests;
      $log.log('the data', data);
      $log.info($scope.friendRequests)
    })

  }
  $scope.clearNotifications = function(){
    socket.emit('clear:friendRequests', {currentUser: angular.copy($scope.username)});
  }

}])

;
