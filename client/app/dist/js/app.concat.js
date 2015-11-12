'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.homepage',
  'myApp.view1',
  'myApp.view2',
  'myApp.version',
  'myApp.login-logout'
])

// .config(['$routeProvider', function($routeProvider) {
//   $routeProvider.otherwise({redirectTo: '/'});
// }])

;

;'use strict';

angular.module('myApp.homepage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'view/home/home.html',
    controller: 'homepage',
  });
}])

.controller('homepage', ['$scope', function($scope) {

}]);;'use strict';

angular.module('myApp.login-logout', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'view/login-logout/login-logout.html',
    //controller: 'loginLogout',
  });
}])

.controller('loginLogout', ['$scope', function($scope) {

}]);;'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view/view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', function($scope) {

}]);;'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view/view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', [function() {

}]);