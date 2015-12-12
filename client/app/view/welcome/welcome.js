angular.module('myApp.welcome', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/welcome', {
  	authenticate: false,
    templateUrl: 'view/welcome/welcome.html',
    controller: 'welcomeCtrl'
  });
}])

.controller('welcomeCtrl', ['$scope', function($scope) {
  // Initiate WOW effect for the Welcome page
  new WOW().init();
  // Initiate Stellar effect for the Welcome page only if no mobile
  var isMobile = {
    Android: function() {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
  };
  
  if( !isMobile.any() ){
    $(window).stellar();
  }

  var windowHeight = $(window).height();

  // Set first section height
  $('.section.first').height(windowHeight - 51);
}]);