angular.module('myApp.collaboration-page')


.controller('publish', ['$scope', '$uibModal', 'techList', '$uibModalInstance', 'project', 'projectUsers', '$rootScope', 'Project', 'socket', 'currentUser', function($scope, $uibModal, techList, $uibModalInstance, project, projectUsers, $rootScope, Project, socket, currentUser){
  
  $scope.projectInfo = project;
  $scope.projectUsers = projectUsers;
  $scope.techList = techList.getTechList();
  $scope.yourTechList = [];
  $scope.profilePic = '';

  console.log('projectInfo', $scope.projectInfo);

  var fileName = Math.random().toString(36).substr(2, 15);

  $scope.addTech = function(tech, index){
    if ($scope.yourTechList.indexOf(tech) !== -1) {
      $scope.techList.splice(index, 1);
    } else {
      $scope.yourTechList.push(tech);
      $scope.techList.splice(index, 1);
      $scope.searchText = '';
    }
  };
  $scope.removeTech = function(tech, index) {
    $scope.techList.push(tech); 
    $scope.yourTechList.splice(index, 1);  
  };

  $scope.submitPicture = function(){
    Project.signRequest($scope.profilePic, fileName)
    $scope.projectInfo.picture = 'https://mks-thesis-project.s3.amazonaws.com/pictures/projects/'+fileName
  }
  $scope.$watch('profilePic', function(){
    if($scope.profilePic.size < 5242880){
      $scope.submitPicture();
    }
  })

  $scope.ok = function(){
    // pass change published property to true, add published date and pass in list of languages used to previous controller to relate project node to those technologies
    var date = new Date();
    $scope.projectInfo.published = 'true';
    $scope.projectInfo.publishDate = date.getTime();

    var obj = {}
    obj.updatedProjectInfo = $scope.projectInfo;
    obj.techs = [];

    for(var i = 0; i < $scope.yourTechList.length; i++){
      obj.techs.push({name: $scope.yourTechList[i]});
    }

    for(var k = 0; k < $scope.projectUsers.length; k++) {
      console.log('store projectinvite', $scope.projectUsers[k].username);
      if($scope.projectUsers[k].username !== currentUser){
        socket.emit("store:projectInvite", {username: $scope.projectUsers[k].username});
        socket.emit('notify:otherUser', {username: $scope.projectUsers[k].username, subject: 'projectInvite'});
      }
    }
    if($scope.profilePic.size < 5242880){
      $uibModalInstance.close(obj);
    }
  }

  $scope.cancel = function(){
    $uibModalInstance.dismiss('cancel');
  }
}])

.controller('editResources', ['$scope', '$uibModal', '$uibModalInstance', 'project', function($scope, $uibModal, $uibModalInstance, project){

  $scope.projectInfo = project;

  $scope.ok = function(){
    $uibModalInstance.close($scope.projectInfo);
  }

  $scope.cancel = function(){
    $uibModalInstance.dismiss('cancel');
  }
}])

.controller('confirmDelete', ['$scope', '$uibModal', '$uibModalInstance', 'project', 'username', function($scope, $uibModal, $uibModalInstance, project, username){
  
  $scope.projectInfo = project;
  $scope.userInput = '';
  $scope.username = username;

  $scope.ok = function(){
    $uibModalInstance.close($scope.projectInfo);
  }

  $scope.cancel = function(){
    $uibModalInstance.dismiss('cancel');
  }

}])

.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                scope.$apply(function () {
                    scope.fileread = changeEvent.target.files[0];
                    // or all selected files:
                    // scope.fileread = changeEvent.target.files;
                });
            });
        }
    }
}]);

