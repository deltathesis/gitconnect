angular.module('myApp.connect', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/connect', {
  	authenticate: true,
    templateUrl: 'view/connect/connect.html',
    controller: 'connectCtrl'
  });
}])

.directive('onFinishRender', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
}])

.controller('connectCtrl', ['$scope', function($scope) {

  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
      var swiper = new Swiper('.swiper-container', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        coverflow: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows : true
        },
        // Navigation arrows
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        // CallBack functions
        // Might define onInit if necessary
        onTransitionEnd: function() {
          var selectedUser = $('.swiper-slide-active').data('dev-id');
          for (var i = 0; i < users.length; i++) {
            if (users[i].id === selectedUser) {
              $scope.selectedUser = users[i];
            }
          }
          $scope.$apply();
        }
      }); 
  });

  var users = [
    {
      id: 1111,
      name: 'Royce Leung',
      picture: 'assets/pictures/users/royce.jpg',
      bio: 'Hello, I am Royce, and I am a Geeeenius. I also love Humus. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      projects: ['Foofly', 'Angular Seed', 'Instacutz'],
      languages: ['Javascript', 'Python', 'CSS', 'HTML5', 'Socket.io']
    },
    {
      id: 2222,
      name: 'Renan Deswarte',
      picture: 'assets/pictures/users/renan.jpg',
      bio: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      projects: ['BallR', 'Which One?', 'Instacutz', 'GitConnect'],
      languages: ['Javascript', 'Angular', 'Sass', 'CSS', 'HTML5', 'Firebase']
    },
    {
      id: 3333,
      name: 'Yusuf Modan',
      picture: 'assets/pictures/users/yumo.jpg',
      bio: 'Hello, I am Yusuf, and I am a Geeeenius. I also love Humus. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      projects: ['Foofly', 'GitConnect', 'Instacutz', 'Fetch'],
      languages: ['Javascript', 'Backbone', 'Django', 'HTML5', 'MongoDB']
    },
    {
      id: 4444,
      name: 'Chris Nixon',
      picture: 'assets/pictures/users/chris.jpg',
      bio: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      projects: ['GitConnect', 'Android Lollipop', 'Fetch'],
      languages: ['Javascript', 'Grunt', 'Gulp', 'HTML5', 'Neo4J']
    },
    {
      id: 5555,
      name: 'Jake Garelick',
      picture: 'assets/pictures/users/jake.jpg',
      bio: 'Hello, I am Jake, and I am a Geeeenius. I also love Humus. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      projects: ['Fetch', 'Bootstrap', 'Instacutz', 'GitConnect'],
      languages: ['Javascript', 'C++', 'Java', 'Shift', 'SQL', 'HTML5']
    }
  ];

  $scope.users = users;

}]);