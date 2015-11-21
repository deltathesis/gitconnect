angular.module('myApp.privateChat', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/privateChat', {
    authenticate: true,
    templateUrl: 'view/privateChat/privateChat.html',
    controller: 'privateChatController'
  });
}])

.controller('privateChatController', ['$scope', 'socket', '$cookies', 'Cookie', function($scope, socket, $cookies, Cookie) {

  $scope.roomMessages; //key is roomName, value is another obj which has keys users and messages
  $scope.name;                            //users is an array [selfUser, targetuser]
  $scope.currentRoom;                     //messages is obj with props text, room, otheruser
  $scope.currentTarget = 'Message your Connections!';
  var cookie = $cookies.get('github');
  var cookieObj = Cookie.parseCookie(cookie);
  $scope.username = cookieObj.username;
  /** Socket Listeners **/

  socket.emit('myusername', $scope.username);

  socket.on('init', function (data) {
    $scope.name = data.name;
    $scope.users = data.users;
    $scope.roomMessages = data.rooms;

    for(var key in $scope.roomMessages) {
      if($scope.roomMessages[key].users[0] !== $scope.name) {
        var temp = $scope.roomMessages[key].users[0];
      $scope.roomMessages[key].users[0] = $scope.roomMessages[key].users[1];
      $scope.roomMessages[key].users[1] = temp;
      }
    }
    $scope.changeRoom(Object.keys(data.rooms)[0])
  });

  socket.on('bigInit', function (data) {
    $scope.users = data.users;
  })

  socket.on('send:message', function (message) {

    //if room doesn't exist, create it
    var users = [$scope.name, message.user];
    if(!$scope.roomMessages) {
      $scope.roomMessages = {};
    }
    if(!$scope.roomMessages[message.room]) {
      //new room Init
      $scope.roomMessages[message.room] = {};
      $scope.roomMessages[message.room].users;
      $scope.roomMessages[message.room].messages = [];
    }

    if(!$scope.currentRoom) {
      $scope.currentRoom = message.room;
    }

    $scope.roomMessages[message.room].users = users;
    $scope.roomMessages[message.room].messages.push(message);
  });

  // add a message to the conversation when a user disconnects or leaves the room
  socket.on('user:left', function (data) {
    console.log('User disconnected');
  });

  // socket.on('insertData', function(data){
  //   socket.emit('storeData', angular.copy($scope.roomMessages));
  // })

  /**Scope Functions **/

  $scope.changeRoom = function(newRoom) {
    $scope.currentRoom = newRoom;

    //setting current Target to other user
    for(var i in $scope.roomMessages) {
      if(i === newRoom) {
        $scope.currentTarget = $scope.roomMessages[i].users[1];
      }
    }
  }

  //Creates A Private Message Room instance
  $scope.createNewRoom = function(targetUser) {
    console.log($scope.roomMessages);
    if(!$scope.roomMessages) {
      $scope.roomMessages = {};
    }
    var newRoom = $scope.username + targetUser;
    var twoUsers = [$scope.username, targetUser];
    var roomObj = { 
      roomName : newRoom,
      users : twoUsers
    };
    socket.emit('join:privateRoom', roomObj);
    //init new Room
    $scope.roomMessages[newRoom] = {};
    $scope.roomMessages[newRoom].users = twoUsers;
    $scope.roomMessages[newRoom].messages = [];

    $scope.currentTarget = targetUser;
    $scope.currentRoom = newRoom;
    $scope.newUser = '';
    console.log($scope.roomMessages);
  }

  //send Direct Message
  $scope.sendPrivateMessage = function(target) {
    socket.emit('send:privateMessage', {
    message: $scope.message,
    room: target
    });
    $scope.roomMessages[$scope.currentRoom].messages.push({
      user: $scope.name,
      text: $scope.message
    });
    $scope.message = '';
    scrollToBottom();
    socket.emit('storeData', angular.copy($scope.roomMessages));
    socket.emit('notify', {target: angular.copy($scope.currentTarget), currentUser: angular.copy($scope.name)});
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