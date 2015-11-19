angular.module('myApp.privateChat', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/privateChat', {
    authenticate: true,
    templateUrl: 'view/privateChat/privateChat.html',
    controller: 'privateChatController'
  });
}])

.controller('privateChatController', ['$scope', 'socket', function($scope, socket) {

  $scope.rooms = [];        //list of rooms the user is a part of and the users in that room.
  $scope.roomMessages = {}; //contains the messages of every room.
  $scope.name;
  $scope.users;
  $scope.currentRoom;
  $scope.currentTarget;
  $scope.roomMessages[$scope.currentRoom] = [];


  /** Socket Listeners **/

  socket.on('init', function (data) {
    $scope.name = data.name;
    $scope.users = data.users;
  });

  socket.on('testing', function(data) {
    console.log('it worked');
  })

  //
  socket.on('send:message', function (message) {
    if(!$scope.roomMessages[message.room]) {
      $scope.roomMessages[message.room] = [];

      var roomObj = { 
        roomName : message.room,
        users : [$scope.name, message.user]
      };
      $scope.rooms.push(roomObj);
    }
    if(!$scope.currentRoom) {
      $scope.currentRoom = message.room;
    }
    $scope.roomMessages[message.room].push(message);
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
  var i, user;
  for (i = 0; i < $scope.users.length; i++) {
    user = $scope.users[i];
    if (user === data.name) {
      $scope.users.splice(i, 1);
      break;
    }
  }
});

  /**Scope Functions **/

  $scope.changeRoom = function(newRoom) {
    console.log('Old Room: ', $scope.currentRoom);
    console.log('changing room to: ', newRoom);
    $scope.currentRoom = newRoom;

    //setting current Target to other user
    for(var i = 0; i < $scope.rooms.length; i++) {
      console.log('am i here');
      if($scope.rooms[i].roomName === newRoom) {
        $scope.currentTarget = $scope.rooms[i].users[1];
        console.log('Target: ', $scope.currentTarget);
      }
    }
  }

  //Creates A Private Message Room instance
  $scope.createNewRoom = function(targetUser) {
    var newRoom = $scope.name + targetUser;
    $scope.currentTarget = targetUser;
    var twoUsers = [$scope.name, targetUser];
    var roomObj = { 
      roomName : newRoom,
      users : twoUsers
    };
    socket.emit('join:privateRoom', roomObj);
    $scope.rooms.push(roomObj);
    $scope.roomMessages[newRoom] = [];
    $scope.currentRoom = newRoom;
    $scope.newUser = '';
  }

  //send Direct Message
  $scope.sendPrivateMessage = function(target) {
    socket.emit('send:privateMessage', {
    message: $scope.message,
    room: target
    });
    $scope.roomMessages[$scope.currentRoom].push({
      user: $scope.name,
      text: $scope.message
    });
    console.log('Messages in current Room: ', $scope.roomMessages[$scope.currentRoom]);
    $scope.message = '';
    scrollToBottom();
  };

  $scope.sendMessage = function () {
    socket.emit('send:message', {
      message: $scope.message
    });
    $scope.messages.push({
      user: $scope.name,
      text: $scope.message
    });
    // var objDiv = document.getElementById("your_div");
    // objDiv.scrollTop = objDiv.scrollHeight;
    // clear message box
    $scope.message = '';
    scrollToBottom();
  };

  var scrollToBottom = function() {
    setTimeout(function() {
      $('#bigMessage-container').scrollTop($('#bigMessage-container')[0].scrollHeight);
    }, 50);
  }

  //Allow user to press enter to send message
  $('#sendingMessage').on('keyup', function(e) {
    if (e.which === 13 && ! e.shiftKey) {
      $('.messageButton').click();
    }
  });


var users = [
{
  id: 'Dude1',
  name: 'Royce Leung',
  picture: 'assets/pictures/users/royce.jpg',
  bio: 'Test',
  projects: ['Foofly', 'Angular Seed', 'Instacutz'],
  languages: ['Javascript', 'Python', 'CSS', 'HTML5', 'Socket.io']
},
{
  id: 'Dude2',
  name: 'Renan Deswarte',
  picture: 'assets/pictures/users/renan.jpg',
  bio: 'Ayyyyyyy lmaooooooo',
  projects: ['BallR', 'Which One?', 'Instacutz', 'GitConnect'],
  languages: ['Javascript', 'Angular', 'Sass', 'CSS', 'HTML5', 'Firebase']
},
{
  id: 'Dude3',
  name: 'Yusuf Modan',
  picture: 'assets/pictures/users/yumo.jpg',
  bio: 'Learn or churn',
  projects: ['Foofly', 'GitConnect', 'Instacutz', 'Fetch'],
  languages: ['Javascript', 'Backbone', 'Django', 'HTML5', 'MongoDB']
},
{
  id: 'Dude4',
  name: 'Chris Nixon',
  picture: 'assets/pictures/users/chris.jpg',
  bio: 'currently Presupposing',
  projects: ['GitConnect', 'Android Lollipop', 'Fetch'],
  languages: ['Javascript', 'Grunt', 'Gulp', 'HTML5', 'Neo4J']
},
{
  id: 'Dude5',
  name: 'Jake Garelick',
  picture: 'assets/pictures/users/jake.jpg',
  bio: 'Im super smart',
  projects: ['Fetch', 'Bootstrap', 'Instacutz', 'GitConnect'],
  languages: ['Javascript', 'C++', 'Java', 'Shift', 'SQL', 'HTML5']
}
];

$scope.fakeUsers = users;

}]);