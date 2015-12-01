angular.module('myApp.header', [])

.controller('headerController', ['$scope', 'socket', '$cookies', 'Cookie', '$log', 'projectCheck', '$rootScope', '$location', function($scope, socket, $cookies, Cookie, $log, projectCheck, $rootScope, $location) {
  var cookie = $cookies.get('gitConnectDeltaKS');
  if(cookie){

    var cookieObj = Cookie.parseCookie(cookie);

    $scope.username = cookieObj.username;
    
    socket.emit('giveMeDATA', {username: cookieObj.username});

    socket.on('theDATA', function(data){
      $scope.unreadMessages = data.messageNotifications;
      $scope.friendRequests = data.friendRequests;
    })

  }
  $scope.clearNotifications = function(){
    socket.emit('clear:friendRequests', {currentUser: angular.copy($scope.username)});
  };  

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

  // Catch call and return if user already in a project
  $rootScope.$on('hasProjectCheck', function() { 
    $rootScope.$broadcast('hasProjectCheckReturn', $scope.hasProject);
  });

  $rootScope.$on('projectStarted', function(event, project) { 
    $scope.hasProject = true;
    $scope.projectLink = project.projectId;
    $location.path('/collaboration-page/' + project.projectId);
  });

}])

;
