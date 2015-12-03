angular.module('myApp.collaboration-page')


.controller('publish', ['$scope', '$uibModal', 'techList', '$uibModalInstance', 'project', '$rootScope', 'Project', function($scope, $uibModal, techList, $uibModalInstance, project, $rootScope, Project){
  
  $scope.projectInfo = project
  $scope.techList = techList.getTechList();
  $scope.yourTechList = [];
  $scope.addTech = function(tech, index){
    if ($scope.yourTechList.indexOf(tech) !== -1) {
      $scope.techList.splice(index, 1);

      //remove the default null language if it exists
    } else if ($scope.yourTechList.indexOf('null') !== -1){
      $scope.yourTechList.splice($scope.yourTechList.indexOf('null'), 1) 
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
    if($scope.profilePic.size < 5242880){
      Project.get_signed_request($scope.profilePic);
    }
    
    $uibModalInstance.close(obj);

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

.controller('confirmDelete', ['$scope', '$uibModal', '$uibModalInstance', 'project', function($scope, $uibModal, $uibModalInstance, project){
  
  $scope.projectInfo = project;
  $scope.userInput = '';


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

