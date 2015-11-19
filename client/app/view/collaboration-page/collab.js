angular.module('myApp.collaboration-page', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/collaboration-page', {
    authenticate: true,
    templateUrl: 'view/collaboration-page/collab.html',
    controller: 'collaboration-page',
  });
}])

.controller('collaboration-page', ['$scope', function($scope) {

  $scope.projectInfo = {
    name: 'GitConnect',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    tech: ['HTML5', 'JavaScript', 'Firebase', 'MySql'],
    github_url: 'https://github.com/deltathesis/gitconnect'
    }

  $scope.messages = [
    {
      username: "Chris Nixon",
      message: "Hey this is super cool"
    }
  ];

  $scope.resources = {
    project_repo: 'https://github.com/deltathesis/gitconnect',
    scrum_board: 'https://trello.com/b/QNvGVucJ/gameplan',
    website: "",
    storage: "",
    database: "",
    code_library: ""
  }

  $scope.messageSubmit = function(){
    if($scope.text){
      console.log($scope.text)
      $scope.messages.push({
        username: "Chris Nixon",
        message: $scope.text
      });
      $scope.text = "";
    }
  }

}]);
