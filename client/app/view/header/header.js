angular.module('myApp.header', [])

.controller('headerController', ['$scope', 'socket', '$cookies', 'Cookie', '$log', 'projectCheck', '$rootScope', '$location', '$window', function($scope, socket, $cookies, Cookie, $log, projectCheck, $rootScope, $location, $window) {
  var cookie = $cookies.get('gitConnectDeltaKS');
  if(cookie){

    var cookieObj = Cookie.parseCookie(cookie);

    $scope.username = cookieObj.username;
    
    socket.emit('giveMeDATA', {username: cookieObj.username});

    socket.on('theDATA', function(data){
      $scope.unreadMessages = data.messageNotifications;
      $scope.friendRequests = data.friendRequests;
    })

    socket.on('youveGotMail', function(data){
      socket.emit('giveMeDATA', {username: cookieObj.username});
    })
    socket.on('friendRequest:notification', function(data){
      socket.emit('giveMeDATA', {username: cookieObj.username});
    })
    socket.on('showCollabPage:notification', function(data){
      $scope.hasProject = true;
      $scope.projectLink = data.projectId;
      $location.path('/collaboration-page/' + data.projectId);
      // socket.emit('giveMeDATA', {username: cookieObj.username});
    })

  }
  $scope.clearFriendRequestNotifications = function(){
    socket.emit('clear:friendRequests', {currentUser: angular.copy($scope.username)});
  };  

  $scope.clearMessageNotifications = function() {
    socket.emit('notify:message', {target: angular.copy($scope.username), currentUser: angular.copy($scope.username)});
  }

  $scope.hasProject = false;

  $scope.checkProjectPage = function() {
    var cookie = $cookies.get('gitConnectDeltaKS');
    if(cookie){
      projectCheck.getProject(cookieObj.username).then(function(project) {
        if (project.project.length > 0) {
          $scope.hasProject = true;
          $scope.projectLink = project.project[0].projectId;
        }
      });
    }
  };
  $scope.login = function() {
    $window.location.href='/auth/github'
  }

  $scope.logout = function() {
    $window.location.href='/auth/logout'
  }

  // Catch call and return if user already in a project
  $rootScope.$on('hasProjectCheck', function() { 
    $rootScope.$broadcast('hasProjectCheckReturn', $scope.hasProject);
  });

  $rootScope.$on('projectPublished', function(){
    $scope.hasProject = false;
  })

  $rootScope.$on('projectStarted', function(event, project) { 
    $scope.hasProject = true;
    $scope.projectLink = project.projectId;
    $location.path('/collaboration-page/' + project.projectId);
  });

}])

;
