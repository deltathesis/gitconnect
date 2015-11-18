angular.module('myApp.groupChat', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/groupChat', {
    authenticate: true,
    templateUrl: 'view/groupChat/groupChat.html',
    controller: 'groupChatController'
  });
}])

.controller('groupChatController', ['$scope', 'socket', function($scope, socket) {
  $scope.friends = 'Royce';
    // var socket = io.connect();

    $scope.messages = [];

    /** Socket Listeners **/

  // Socket listeners
  // ================

  socket.on('init', function (data) {
    $scope.name = data.name;
    $scope.users = data.users;
  });

  socket.on('send:message', function (message) {
    $scope.messages.push(message);
  });

  socket.on('user:join', function (data) {
    // $scope.messages.push({
    //   user: 'ALL',
    //   text: 'User ' + data.name + ' has joined.'
    // });
  $scope.users.push(data.name);
});

  // add a message to the conversation when a user disconnects or leaves the room
  socket.on('user:left', function (data) {
    // $scope.messages.push({
    //   user: 'ALL',
    //   text: 'User ' + data.name + ' has left.'
    // });
  var i, user;
  for (i = 0; i < $scope.users.length; i++) {
    user = $scope.users[i];
    if (user === data.name) {
      $scope.users.splice(i, 1);
      break;
    }
  }
});

  $scope.sendMessage = function () {
    socket.emit('send:message', {
      message: $scope.message
    });
    $scope.messages.push({
      user: $scope.name,
      text: $scope.message
    });
    // var elem = document.getElementById('chat-messages');
    // elem.scrollTop = elem.scrollHeight;
    // console.log('height', elem.scrollHeight);

    // clear message box
    $scope.message = '';
  };

 $('#sendingMessage').on('keyup', function(e) {
    if (e.which === 13 && ! e.shiftKey) {
        $('.messageButton').click();
    }
});

// window.setInterval(function() {
//   var elem = document.getElementById('chat-messages');
//   elem.scrollTop = elem.scrollHeight;
// }, 100);




  var users = [
    {
      id: 1111,
      name: 'Royce Leung',
      picture: 'assets/pictures/users/royce.jpg',
      bio: 'Test',
      projects: ['Foofly', 'Angular Seed', 'Instacutz'],
      languages: ['Javascript', 'Python', 'CSS', 'HTML5', 'Socket.io']
    },
    {
      id: 2222,
      name: 'Renan Deswarte',
      picture: 'assets/pictures/users/renan.jpg',
      bio: 'Ayyyyyyy lmaooooooo',
      projects: ['BallR', 'Which One?', 'Instacutz', 'GitConnect'],
      languages: ['Javascript', 'Angular', 'Sass', 'CSS', 'HTML5', 'Firebase']
    },
    {
      id: 3333,
      name: 'Yusuf Modan',
      picture: 'assets/pictures/users/yumo.jpg',
      bio: 'Learn or churn',
      projects: ['Foofly', 'GitConnect', 'Instacutz', 'Fetch'],
      languages: ['Javascript', 'Backbone', 'Django', 'HTML5', 'MongoDB']
    },
    {
      id: 4444,
      name: 'Chris Nixon',
      picture: 'assets/pictures/users/chris.jpg',
      bio: 'currently Presupposing',
      projects: ['GitConnect', 'Android Lollipop', 'Fetch'],
      languages: ['Javascript', 'Grunt', 'Gulp', 'HTML5', 'Neo4J']
    },
    {
      id: 5555,
      name: 'Jake Garelick',
      picture: 'assets/pictures/users/jake.jpg',
      bio: 'Im super smart',
      projects: ['Fetch', 'Bootstrap', 'Instacutz', 'GitConnect'],
      languages: ['Javascript', 'C++', 'Java', 'Shift', 'SQL', 'HTML5']
    }
  ];

  $scope.fakeUsers = users;

}]);