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
		return !!$cookies.get('gitConnectDeltaKS');
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

	var getProfile = function(username) {
		return $http({
			cache: true,
			method: 'GET',
			url: '/api/user/' + username
		}).then(function(res) {
			return res.data.user[0];
		});
	};

	var getProfileAndRelations = function(username) {
		return $http({
			cache: false,
			method: 'GET',
			url: '/api/user/relations/' + username
		}).then(function(res) {
			return res.data.user;
		});
	};

	var getMatches = function() {
		var cookie = $cookies.get('gitConnectDeltaKS');
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
		getMatches: getMatches,
		getProfileAndRelations: getProfileAndRelations,
		getProfile: getProfile
	};

}])

.factory('UserForm', ['$http', function($http) {
	var postForm = function(object) {
		return $http({
			cache: true,
			method: 'POST',
			url: '/api/user/updateform',
			data: { data: object }
		}).then(function successCallback(response) {
		    console.log('success')
	  }, function errorCallback(response) {
	    console.log('error: ', reponse);
  	});
	};

	return {
		postForm: postForm
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

.factory('availabilityToggle', ['$http', function($http) {
	var changeAvailability = function(object) {
		return $http({
			cache: true,
			method: 'POST',
			url: '/api/user/availabilitytoggle',
			data: { data: object }
		}).then(function successCallback(response) {
		    console.log('success')
	  }, function errorCallback(response) {
	    console.log('error: ', reponse);
  	});
	};

	return {
		changeAvailability: changeAvailability
	};
}])

.service('userOwnTech', function() {
  this.userTech = [];
  this.userAddress = '';
  this.userBio = '';

  this.setTech = function(techlist) {
        this.userTech = techlist;
  };
  this.getTech = function() {
        return this.userTech;
  };

  this.setAddress = function(address) {
        this.userAddress = address;
  };
  this.getAddress = function() {
        return this.userAddress;
  };

  this.setBio = function(bio) {
        this.userBio = bio;
  };
  this.getBio = function() {
        return this.userBio;
  };
})

.factory('Project', ['$http', '$cookies', 'Cookie', function($http, $cookies, Cookie) {

  var getInfos = function(id) {
    return $http({
      cache: true,
      method: 'GET',
      url: '/api/project/' + id
    }).then(function(res) {
      return res.data;
    });
  };

  return {
    getInfos: getInfos
  };

}])


;