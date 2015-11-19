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

.factory('User', ['$http', '$cookies', '$q', function($http, $cookies, $q) {

	var matches = null;

	var getMatches = function() {
		if (matches) { //caching
			$q(function(resolve, reject) {
				resolve(matches);
			}).then(function(matches) {
				return matches;
			});
		}
		var user = $cookies.get('github');
		var promise = $http({
			method: 'GET',
			url: '/api/user/' + user + '/matches'
		}).success(function(data) {
			//console.log(data.matches);
			matches = data.matches;
			return data.matches;
		});
		return promise;
	};

	return {
		getMatches: getMatches
	};

}]);
