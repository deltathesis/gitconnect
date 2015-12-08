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
			url: '/auth/logout'
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

  var postRating = function(user, rating) {
    return $http({
      cache: false,
      method: 'POST',
      url: '/api/user/' + user.username + '/rate',
      data: {
        id: user.id,
        rating: rating
      }
    });
  };

  var getAllUsers = function() {
    return $http({
      cache: true,
      method: 'GET',
      url: '/api/user/getAllUsers'
    }).then(function(res) {
      return res.data;
    })
  }

	var getProfileAndRelations = function(username, relLabel) {
    relLabel = relLabel || '';
		return $http({
			cache: false,
			method: 'GET',
			url: '/api/user/relations/' + username + '?relLabel=' + relLabel
		}).then(function(res) {
			return res.data.user;
		});
	};

	var getMatches = function() {
		var cookie = $cookies.get('gitConnectDeltaKS');
		var user = Cookie.parseCookie(cookie);
		return $http({
			cache: false,
			method: 'GET',
			url: '/api/user/' + user.username + '/matches'
		}).then(function(res) {
			return res.data.matches;
		});
	};

  var removeConnection = function (user1Id, user2Id) {
    return $http({
      method: 'GET',
      url: '/api/connection/delete?user1Id=' + user1Id + '&user2Id=' + user2Id + '&type=CONNECTED' 
    });
  };

	return {
		getMatches: getMatches,
		getProfileAndRelations: getProfileAndRelations,
		getProfile: getProfile,
    getAllUsers: getAllUsers,
    postRating: postRating,
    removeConnection: removeConnection
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
  this.userFullName = '';

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

  this.setFullName = function(name) {
    this.userFullName = name;
  };
  this.getFullName = function() {
    return this.userFullName;
  };
})

.factory('Project', ['$http', '$cookies', 'Cookie', function($http, $cookies, Cookie) {

  var addCollaborators = function(projectId, newCollaborators){
    return $http({
      method: 'POST',
      url: '/api/project/addCollaborators',
      data: {
        projectId: projectId,
        newCollaborators: newCollaborators
      }
    }).then(function(res){
      return res.status;
    })
  }

  var getInfos = function(id) {
    return $http({
      cache: true,
      method: 'GET',
      url: '/api/project/' + id
    }).then(function(res) {
      return res.data;
    });
  };

  var getUsers = function(id) {
    return $http({
      cache: true,
      method: 'GET',
      url: '/api/project/users/' + id
    }).then(function(res) {
      return res.data;
    });
  };

  var getLanguages = function(id) {
    return $http({
      cache: true,
      method: 'GET',
      url: '/api/project/languages/' + id
    }).then(function(res) {
      return res.data;
    })
  }

  var createProject = function(collaborators, projectName){
    return $http({
      method: 'POST',
      url: 'api/project/creation',
      data: {
        collaborators: collaborators,
        projectName: projectName
      }
    }).then(function(res){
      return res;
    })
  }

  var updateProject = function(projectObj, oldProject, langArray, users){
    return $http({
      method: 'POST',
      url: '/api/project/update',
      data: {
        data: projectObj, 
        oldProject: oldProject, 
        langArray: langArray,
        users: users
      }
    }).then(function(res){
      return res.status;
    });
  };

  var deleteProject = function(projectId){
    return $http({
      method: 'POST',
      url: '/api/project/delete',
      data: {
        projectId: projectId
      }
    }).then(function(res){
      return res.status
    });
  };

  var signRequest = function(file, fn){

      var xhr = new XMLHttpRequest();
      
      xhr.open("GET", "/api/sign_s3?file_name="+fn+"&file_type="+file.type);
      xhr.onreadystatechange = function(){
          if(xhr.readyState === 4){
              if(xhr.status === 200){
                  var response = JSON.parse(xhr.responseText);
                  upload_file(file, response.signed_request, response.url);
              }
              else{
                  alert("Could not get signed URL.");
              }
          }
      };
      xhr.send();
  }

  var upload_file = function(file, signed_request, url){
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", signed_request);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    xhr.onerror = function() {
        alert("Oops it looks like your picture was not uploaded properly");
    };
    xhr.send(file);

  }


  return {
    addCollaborators: addCollaborators,
    createProject: createProject,
    getInfos: getInfos,
    getUsers: getUsers,
    updateProject: updateProject,
    deleteProject: deleteProject,
    getLanguages: getLanguages,
    signRequest: signRequest
  };

}])

.factory('projectCheck', ['$http', function($http) {

  var getProject = function(username) {
    return $http({
      cache: true,
      method: 'GET',
      url: '/api/project/current/' + username
    }).then(function(res) {
      return res.data;
    });
  };

  return {
    getProject: getProject
  };

}])

.factory('ProjectList', ['$http', function($http) {

	// Gets all published community projects from the server via http
	// Returns an array of projects sorted by votes (highest to lowest)
	var getProjects = function() {
		return $http({
			//cache: true,
			method: 'GET',
			url: '/api/project/list'
		}).then(function(res) {
			return res.data.projects;
		});
	};

	// Updates a project's votes via http
	// id: int - the id of the project
	// up: boolean - true -> upvote, false -> downvote
	var vote = function(projectId, userId, up) {
		return $http({
			method: 'POST',
			url: 'api/project/vote',
			data: {
				projectId: projectId,
				userId: userId,
				up: up
			}
		}).then(function(res) {
			return res.data;
		});
	};

	return {
		getProjects: getProjects,
		vote: vote
	};

}])

.factory('newsfeed', ['$http', function($http) {

  var getNewsFeed = function(username) {
    return $http({
      cache: true,
      method: 'GET',
      url: '/api/newsfeed/' + username
    }).then(function(res) {
      return res.data;
    });
  };

  return {
    getNewsFeed: getNewsFeed
  };

}])