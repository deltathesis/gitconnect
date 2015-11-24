angular.module('myApp.header', [])

.controller('headerController', ['$scope', 'socket', '$cookies', 'Cookie', function($scope, socket, $cookies, Cookie) {
  var cookie = $cookies.get('gitConnectDeltaKS');
  if(cookie){
    var cookieObj = Cookie.parseCookie(cookie);
    console.log('username on cookie', cookieObj.username);
    socket.emit('giveMeDATA', {username: cookieObj.username});
    socket.on('theDATA', function(data){
      console.log('unread messages', data);
      $scope.unreadMessages = data;
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
