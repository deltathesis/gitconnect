angular.module('myApp.services', [])

.factory('Auth', [ '$http', '$cookies', function($http, $cookies) {

	var user = null;

	var getUser = function() {
		return $http({
				method: 'GET',
				url: '/api/user'
			}).then(function(res) {
				return res.data;
			});
	};

	var logout = function() {
		return $http({
			method: 'GET',
			url: '/logout'
		}).then(function(res) {
			return res.data;
		});
	};

	var isAuth = function() {
		return !!$cookies.get('github');
	};

	return {
		getUser: getUser,
		logout: logout,
		isAuth: isAuth
	};

}])

.factory('socket', ['socketFactory', function (socketFactory) {
  return socketFactory();
}])

.factory('User', ['$http', '$cookies', function($http, $cookies) {

	var getMatches = function() {
		var user = $cookies.get('github');
		return $http({
			cache: true,
			method: 'GET',
			url: '/api/user/' + user + '/matches'
		}).then(function(res) {
			return res.data.matches;
		});
	};

	return {
		getMatches: getMatches
	};

}]);
