angular.module('myApp.collaboration-page', ['ngRoute', 'ui.bootstrap'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/collaboration-page/:id', {
    authenticate: true,
    templateUrl: 'view/collaboration-page/collab.html',
    controller: 'collaboration-page',
    resolve: {
      getProjectInfo: ['$route', 'Project', function($route, Project) {
          return Project.getInfos($route.current.params.id);
      }],
      getProjectUsers: ['$route', 'Project', function($route, Project) {
          return Project.getUsers($route.current.params.id);
      }]
    }
  });
}])

.controller('collaboration-page', ['$scope', '$window', 'User', '$cookies', 'Cookie', 'socket', 'getProjectInfo', 'getProjectUsers', '$uibModal', 'Project', '$location', '$rootScope', function($scope, $window, User, $cookies, Cookie, socket, getProjectInfo, getProjectUsers, $uibModal, Project, $location, $rootScope) {

  var projectInfo = getProjectInfo.project;


  var projectUsers = getProjectUsers;
  
  console.log('project-info', projectInfo);
  console.log('project-users', projectUsers)
  
  for(var key in projectInfo){
    if(projectInfo[key]=== 'null'){
      projectInfo[key] = '';
    }
  }
  //store old project info for database lookup
  var oldProjectInfo = projectInfo
  
  $scope.projectInfo = projectInfo;
  $scope.projectUsers = projectUsers.users;

  var cookie = $cookies.get('gitConnectDeltaKS');
  var cookieObj = Cookie.parseCookie(cookie);
  $scope.newProjectCollaborators = []
  $scope.username = cookieObj.username;
  $scope.currentRoom = $scope.projectInfo.projectId;
  $scope.avatar = cookieObj.avatar;
  $scope.messages = [];
  $scope.currentTime;
  $scope.displayName;
  $scope.actualName;
  $scope.collaboratorTooltip = "Add Collaborator"

  // Set default min height regarding screen height
  $('.page').css('min-height', window.innerHeight - 40 + 'px');
  
  var getOwnName = function() {
    for(var i = 0; i < $scope.projectUsers.length; i++) {
      if($scope.projectUsers[i].username === $scope.username) {
        $scope.actualName = $scope.projectUsers[i].name;
        return $scope.actualName + '(' + $scope.username + ')';
      }
    }
  }

  $scope.displayName = getOwnName();

  /** Socket Listeners **/
  socket.emit('initCollab', {
    name: $scope.username,
    collabRoom: $scope.projectInfo.projectId
  });

  // listen to initializer
  socket.on('initCollab', function(data) {
    if(data[$scope.currentRoom]) {
      $scope.messages = data[$scope.currentRoom];
    }
  })

  //listens to sent message
  socket.on('send:collabMessage' , function(data) {
    $scope.messages.push(data);
  })

  $scope.loadConnections = function(){
    User.getProfileAndRelations($scope.username, 'CONNECTED')

    .then(function(user){
      $scope.connections = user.relationships.CONNECTED;
    })
  }

  $scope.addCollaborator = function(user){
    if($scope.newProjectCollaborators.indexOf(user.username) === -1){
      $scope.newProjectCollaborators.push(user.username)
    }
    $scope.collabForm = ''
  }

  $scope.removeCollaborator = function(index){
    $scope.newProjectCollaborators.splice(index, 1);
  }

  $scope.submitCollaborators = function(){
    $('#myModal').modal('hide');
    var revisedProjectCollaborators = $scope.newProjectCollaborators.map(function(collaborator){
      return {username: collaborator}
    })
    Project.addCollaborators($scope.projectInfo.projectId, revisedProjectCollaborators)
      .then(function(){
        $window.location.reload();
      }).then(function(){
        for(var i = 0; i < revisedProjectCollaborators.length; i++){
          if(revisedProjectCollaborators[i].username !== $scope.username) {
            socket.emit('notify:otherUser', {username: revisedProjectCollaborators[i].username, subject: 'projectInvite'});
            socket.emit('store:projectInvite', {username: revisedProjectCollaborators[i].username});
          }
        }
      })
  }

  $scope.messageSubmit = function(){
    if($scope.text){
    var currentTime = new Date();
      socket.emit('send:collabMessage', {
        room: $scope.currentRoom,
        message: $scope.text,
        date: currentTime,
        name: $scope.displayName,
        avatar: $scope.avatar
      })

      $scope.messages.push({
        avatar: $scope.avatar,
        username: $scope.displayName,
        message: $scope.text,
        date: currentTime
      });

      var roomObj = {};
      roomObj[$scope.currentRoom] = $scope.messages;
      socket.emit('store:collabData', angular.copy(roomObj));

      $scope.text = "";
    }
  };


  /***********************MODALS to publish your project ***************************/
  
  $scope.publish = function(size){
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'view/collaboration-page/projectForm.html',
      controller: 'publish',
      resolve: {
        project: function(){
          return $scope.projectInfo
        },
        projectUsers: function() {
          return $scope.projectUsers;
        },
        currentUser: function(){
          return $scope.username;
        }
      },
      size: size
    });

    modalInstance.result.then(function(obj){
      Project.updateProject(obj.updatedProjectInfo, oldProjectInfo, obj.techs, $scope.projectUsers);     
      $scope.projectInfo = obj.updatedProjectInfo;
      $rootScope.$broadcast('projectPublished')
      $location.path('/my-projects')
    })
  }

  /*******************MODAL to edit resources******************************/
  $scope.editResources = function(size){
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'view/collaboration-page/resources.html',
      controller: 'editResources',
      size: size,
      resolve: {
        project: function(){
          return $scope.projectInfo
        }
      }
    });
    modalInstance.result.then(function(updatedResources){
      Project.updateProject(updatedResources, oldProjectInfo);
      $scope.projectInfo = updatedResources;
    })
  }

  $scope.confirmDelete = function(size){
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'view/collaboration-page/confirmDelete.html',
      controller: 'confirmDelete',
      size: size,
      resolve: {
        project: function(){
          return $scope.projectInfo
        },
        username: function(){
          return $scope.username
        }
      }
    });
    modalInstance.result.then(function(updatedResources){
      Project.deleteProject($scope.projectInfo.projectId).then(function(result) {
        $location.path('/my-projects');
      });
    })
  }

}]);