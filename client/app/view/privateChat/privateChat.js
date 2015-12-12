angular.module('myApp.privateChat', ['ngRoute', 'ui.bootstrap'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/privateChat', {
    authenticate: true,
    templateUrl: 'view/privateChat/privateChat.html',
    controller: 'privateChatController'
  });
}])

.controller('privateChatController', ['$scope', 'socket', '$cookies', 'Cookie', 'User', function($scope, socket, $cookies, Cookie, User) {
  $scope.roomMessages;        //key is roomName, value is another obj which has keys users and messages
  $scope.name;                //users is an array [selfUser, targetuser]
  $scope.currentRoom;         //messages is obj with props text, room, otheruser
  $scope.currentTarget = 'Message your Connections!';

  var cookie = $cookies.get('gitConnectDeltaKS');
  var cookieObj = Cookie.parseCookie(cookie);
  $scope.username = cookieObj.username;
  $scope.allUsers;
  $scope.currentUser;
  $scope.showModal = false;
  User.getAllUsers().then(function(data) {
    socket.emit('myusername', $scope.username);
    $scope.allUsers = data;
    for(var i = 0; i < $scope.allUsers.length; i++) {
      if($scope.allUsers[i].username === $scope.username) {
        $scope.currentUser = $scope.allUsers[i];
      }
    }
  });

  /** Socket Listeners **/

  //send username to sockets
  //initialze private messages you have
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
      for(var i = 0; i < $scope.allUsers.length; i++) {
        if($scope.allUsers[i].username === $scope.roomMessages[key].users[1]) {
          $scope.roomMessages[key].avatar = $scope.allUsers[i].avatar_url;
        }
      }
    }
    $scope.changeRoom(Object.keys(data.rooms)[0]);
    scrollToBottom();
  });

  //list of all users your talking to
  socket.on('bigInit', function (data) {
    $scope.users = data.users;
  })
  //listener for message being sent
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
    scrollToBottom();
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
    scrollToBottom();

  }

  //Creates A Private Message Room instance
  $scope.createNewRoom = function(targetUser) {
    var userExists = false;
    var otherAvatar;
    for(var i = 0; i < $scope.allUsers.length; i++) {
      if($scope.allUsers[i].username === targetUser) {
        otherAvatar = $scope.allUsers[i].avatar_url;
        userExists = true;
      }
      if($scope.allUsers[i].name === targetUser) {
        targetUser = $scope.allUsers[i].username;
        userExists = true;
        otherAvatar = $scope.allUsers[i].avatar_url;
      }
    }

    if(!userExists) {
      //console.log('User not Found');
      $scope.showModal = true;
      return;
    } else {
      $scope.showModal = false;
    }

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
    $scope.roomMessages[newRoom].avatar = otherAvatar;
    $scope.roomMessages[newRoom].messages = [];

    $scope.currentTarget = targetUser;
    $scope.currentRoom = newRoom;
    scrollToBottom();
    $scope.newUser = '';
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
    socket.emit('notify:message', {target: angular.copy($scope.currentTarget), currentUser: angular.copy($scope.name)});
    socket.emit('notify:otherUser', {username: angular.copy($scope.currentTarget), subject: 'messages'});
    // socket.emit('notify:potentialFriend', {target: angular.copy($scope.currentTarget), currentUser: angular.copy($scope.name)});
  };

  var scrollToBottom = function() {
    //$timeout ROYCE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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

  // Set chat box size adapting to the device window height
  var searchContainer = $('.search-container').height();
  var fix = 10;
  var hearderHeight = 50;
  var iPhoneFix = 20;
  $('.allUsers-list').height(window.innerHeight - searchContainer - hearderHeight - iPhoneFix);
  $('.chat-messages').height(window.innerHeight - hearderHeight - fix - iPhoneFix);
  $('.bigMessage-container').height(window.innerHeight - hearderHeight - 180 - iPhoneFix);

  $('body').on('click', '.allUsers-list-elm', function(e) {
    $('.chat-messages').addClass('display');
  });

  $('body').on('click', '.return-chat', function(e) {
    $('.chat-messages').removeClass('display');
  })

}]);