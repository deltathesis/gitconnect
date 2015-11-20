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

.factory('User', ['$http', '$cookies', 'Cookie', function($http, $cookies, Cookie) {

	var getMatches = function() {
		var cookie = $cookies.get('github');
		var user = Cookie.parseCookie(cookie);
		return $http({
			cache: true,
			method: 'GET',
			url: '/api/user/' + user.username + '/matches'
		}).then(function(res) {
			return res.data.matches;
		});
	};

	return {
		getMatches: getMatches
	};

}])

.factory('Cookie', ['$cookies', function($cookies) {

	var parseCookie = function(cookie) {
		var json = cookie.substring(cookie.indexOf("{"), cookie.lastIndexOf("}") + 1);
		return angular.fromJson(json);
	};

	return {
		parseCookie: parseCookie
	};

}])
