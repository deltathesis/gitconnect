angular.module('myApp.header', ['ui.bootstrap'])

.controller('headerController', ['$scope', '$route', 'User', 'Project','socket', '$cookies', 'Cookie', '$log', 'projectCheck', '$rootScope', '$location', '$window', function($scope, $route, User, Project, socket, $cookies, Cookie, $log, projectCheck, $rootScope, $location, $window) {
  var cookie = $cookies.get('gitConnectDeltaKS');
  if(cookie){

    var cookieObj = Cookie.parseCookie(cookie);

    $scope.username = cookieObj.username;

    $scope.newProjectCollaborators = []

    /************************SOCKETS***************************/
    
    socket.emit('giveMeDATA', {username: cookieObj.username});

    socket.on('theDATA', function(data){
      if(data){
        $scope.unreadMessages = data.messageNotifications;
        $scope.friendRequests = data.friendRequests;
        $scope.cashew = data.friendAccepted;
        $scope.projectInvite = data.projectInvite;
      }
    })

    socket.on('youveGotMail', function(data){
      $scope.unreadMessages++;
    })
    socket.on('friendRequest:notification', function(data){
      $scope.friendRequests++;
    })
    socket.on('friendAccepted:notification', function(data){
      $scope.cashew = 1;
      // socket.emit('giveMeDATA', {username: cookieObj.username});
    })

    socket.on('projectInvite:notification', function(){
      console.log('inside of project invite listener')
      $scope.projectInvite = 1;
    })

    /************************SOCKETS***************************/
  }

  $scope.createProject = function(){
    $('#project-create').modal('hide');
    var revisedProjectCollaborators = $scope.newProjectCollaborators.map(function(username){
      return {username: username};
    })
    revisedProjectCollaborators.push({username: $scope.username});
    Project.createProject(revisedProjectCollaborators, $scope.projectName)
    .then(function(res){
      // console.log(res)
      $scope.newProjectCollaborators = [];
      $scope.projectName = '';
      $scope.projectPageRedirect(res.data.projectId);
      for(var i = 0; i < revisedProjectCollaborators.length; i++){
        if(revisedProjectCollaborators[i].username !== $scope.username) {
          socket.emit('notify:otherUser', {username: revisedProjectCollaborators[i].username, subject: 'projectInvite'});
          socket.emit('store:projectInvite', {username: revisedProjectCollaborators[i].username});
        }
      }
    })
  }

  $scope.openProjectCreateModal = function(){
    $('#project-create').modal('show');
    User.getProfileAndRelations($scope.username, 'CONNECTED').then(function(data){
      $scope.connections = data.relationships.CONNECTED;
    })
  }

  $scope.addCollaborator = function(user){
    if($scope.newProjectCollaborators.indexOf(user.username) === -1){
      $scope.newProjectCollaborators.push(user.username);
    }
    $scope.collabForm = '';
  }

  $scope.removeCollaborator = function(index){
    $scope.newProjectCollaborators.splice(index, 1);
  }

  $scope.projectPageRedirect = function(projectId){
    $('#projectPageRedirect').modal('hide');
    $location.path('/collaboration-page/' + projectId);
  };

  $scope.clearFriendRequestNotifications = function(){
    socket.emit('clear:friendRequests', {currentUser: angular.copy($scope.username)});
  };  

  $scope.clearMessageNotifications = function() {
    socket.emit('notify:message', {target: angular.copy($scope.username), currentUser: angular.copy($scope.username)});
  }

  $scope.clearProjectInviteNotification = function(){
    $scope.projectInvite = 0;
    socket.emit('clear:projectInvite', {currentUser: angular.copy($scope.username)});
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

  $scope.clearConnectionNotification = function(){
    socket.emit('clear:friendAccepted', {currentUser: angular.copy($scope.username)});
    $scope.cashew = 0;
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

}]);
