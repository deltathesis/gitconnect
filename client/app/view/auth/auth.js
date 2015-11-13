'use strict';

angular.module('myApp.auth', [])

.controller('AuthController', ['$scope', '$http', 'Auth', function($scope, $http, Auth) {

	$scope.user = null;

	$scope.getUser = function() {
		Auth.getUser().then(function(data) {
			console.log(data.username);
			$scope.user = data.username;
		});
	};

	$scope.logout = function() {
		$scope.user = null;
	};

}]);