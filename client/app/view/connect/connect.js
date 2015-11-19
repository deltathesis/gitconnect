angular.module('myApp.connect', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/connect', {
  	authenticate: true,
    templateUrl: 'view/connect/connect.html',
    controller: 'connectCtrl',
    resolve :{
        matches: ['User', function(User) {
          return User.getMatches();
        }]
      }
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

.controller('connectCtrl', ['$scope', 'matches', function($scope, matches) {

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
        onTransitionStart: function() {
          $('.developer-connect-details').fadeOut(0).fadeIn(500);
          var selectedUser = $('.swiper-slide-active').data('dev-id');
          var users = $scope.users;
          for (var i = 0; i < users.length; i++) {
            if (users[i].id === selectedUser) {
              $scope.selectedUser = users[i];
            }
          }
          $scope.$apply();
        },
      }); 
  });

  $scope.users = matches.data.matches;

}]);
