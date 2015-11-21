angular.module('myApp.subscription', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/subscription', {
    authenticate: true,
    templateUrl: 'view/subscription/subscription.html',
    controller: 'subscriptionPage'
  });
}])

.controller('subscriptionPage', ['$scope', '$location', function($scope, $location) {

  var user = {
    picture: 'assets/pictures/users/royce.jpg',
    name: 'Royce Leung',
    memberDate: 1447797324755,
    ratings: Math.round(4.2),
    bio: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    projects: [
      {name:'Ballr', id:'123'},
      {name:'GitConnect', id:'987'},
      {name:'Foodly', id:'567'},
      {name:'InstaCutz', id:'0987'},
      {name:'Humus', id:'12883'}
    ],
    languages: ['JavaScript', 'AngularJS', 'Sass', 'CSS', 'HTML', 'Firebase']
  }

  $scope.user = user;

  $scope.techList = [
    'JavaScript', 'AngularJS', 'Sass', 'CSS', 'HTML', 'Firebase',
    'Ruby', 'Less', 'Scala', 'Python', 'C++', 'Swift', 'Objective-C',
    'mongoDB', 'Neo4j', 'MySQL', 'SQLite', 'Shell', 'Redis', 'Meteor',
    'jQuery', 'Java', 'Rails', 'React', 'PHP', 'PostgreSQL', 'Node.js',
    'Express', 'Stylus', 'Symfony', 'Wordpress', 'Zend', 'socket.io',
    'Backbone', 'Boostrap', 'Foundation', 'CoffeeScript', 'Bower', 'Django',
    'ActionScript', 'Ember', 'Go', 'Gulp', 'Grunt', 'Laravel', 'Docker'
  ];

  // Remove user existing tech
  $scope.initialTech = function() {
    setTimeout(function () { 
      user.languages.forEach(function(element) {
        var index = $scope.techList.indexOf(element);
         $scope.techList.splice(index, 1); 
         $scope.$apply();
      }) 
    }, 100);
  };

  $scope.addTech = function(tech, index) {
    if (user.languages.indexOf(tech) !== -1) {
      $scope.existed = true;
      $scope.techList.splice(index, 1); 
    } else {
      $scope.existed = false;
      user.languages.push(tech); 
      $scope.techList.splice(index, 1); 
    }
  }

  $scope.removeTech = function(tech, index) {
    $scope.techList.push(tech); 
    user.languages.splice(index, 1);  
  }

  $scope.formSubmit = function() {
    var city = $('#user-location').val();
    var userSelectedTech = user.languages;
    var results = {
      city: city,
      tech : userSelectedTech
    }
    // Here is the results from the submited form
    console.log(results);
    // Redirection to the home page
    $location.path('/');
  }



}]);