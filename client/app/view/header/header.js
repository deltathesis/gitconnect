angular.module('myApp.header', [])

.controller('headerController', ['$scope', 'socket', '$cookies', 'Cookie', function($scope, socket, $cookies, Cookie) {
  var cookie = $cookies.get('gitConnectDeltaKS');
  if(cookie){
    var cookieObj = Cookie.parseCookie(cookie);
    console.log('username on cookie', cookieObj.username);
    socket.emit('giveMeDATA', {username: cookieObj.username});
    socket.on('theDATA', function(data){
      $scope.unreadMessages = data.messageNotifications;
      $scope.freindRequests = data.freindRequests;
      if (!!$scope.unreadMessages) {
        $('.navbar-right .messaging').addClass('notifications');
      }
      if(!$scope.unreadMessages){
        $('.navbar-right .messaging').removeClass('notifications');
      }
    })
    
  }
  // socket.on('getMoreData', function(data){
  //   socket.emit('giveMeDATA', {username: cookieObj.username});
  // })
}])

;
