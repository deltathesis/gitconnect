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

.factory('socket', function($rootScope) {
	var socket = io.connect();
	return {
	  on: function (eventName, callback) {
	    socket.on(eventName, function () {  
	      var args = arguments;
	      $rootScope.$apply(function () {
	        callback.apply(socket, args);
	      });
	    });
	  },
	  emit: function (eventName, data, callback) {
	    socket.emit(eventName, data, function () {
	      var args = arguments;
	      $rootScope.$apply(function () {
	        if (callback) {
	          callback.apply(socket, args);
	        }
	      });
	    })
	  }
	};
})