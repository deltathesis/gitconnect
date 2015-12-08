angular.module('myApp.collaboration-page', ['ngRoute'])

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

.controller('collaboration-page', ['$scope', '$cookies', 'Cookie', 'socket', 'getProjectInfo', 'getProjectUsers', '$uibModal', 'Project', '$location', '$rootScope', function($scope, $cookies, Cookie, socket, getProjectInfo, getProjectUsers, $uibModal, Project, $location, $rootScope) {

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
  $scope.username = cookieObj.username;
  $scope.currentRoom = $scope.projectInfo.projectId;
  $scope.avatar = cookieObj.avatar;
  $scope.messages = [];
  $scope.currentTime;
  $scope.displayName;
  $scope.actualName;

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


  // // Remove modal backdrop bug display
  // $scope.removeModal = function() {
  //   $('.modal-backdrop').remove();
  // }

  /***********************MODALS to publish your project ***************************/

  $scope.publish = function(size){
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'view/collaboration-page/projectForm.html',
      controller: 'publish',
      resolve: {
        project: function(){
          return $scope.projectInfo
        }
      },
      size: size
    });

    modalInstance.result.then(function(obj){
      Project.updateProject(obj.updatedProjectInfo, oldProjectInfo, obj.techs, $scope.projectUsers[0].username, $scope.projectUsers[1].username);     
      $scope.projectInfo = obj.updatedProjectInfo;
      $rootScope.$broadcast('projectPublished')
      $location.path('/projects')
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
      Project.deleteProject($scope.projectInfo.projectId, $scope.projectUsers[0].username, $scope.projectUsers[1].username);
      $rootScope.$broadcast('projectPublished')
      $location.path('/my-projects')
    })
  }

}]);