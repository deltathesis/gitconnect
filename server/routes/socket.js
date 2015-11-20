var userNames = (function () {
  var names = {};

  var claim = function (name) {
    if (!name || names[name]) {
      return false;
    } else {
      names[name] = true;
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it
  var getGuestName = function () {
    var name,
      nextUserId = 1;

    do {
      name = 'Dude' + nextUserId;
      nextUserId += 1;
    } while (!claim(name));

    return name;
  };

  // serialize claimed names as an array
  var get = function () {
    var res = [];
    for (user in names) {
      res.push(user);
    }

    return res;
  };

  var free = function (name) {
    if (names[name]) {
      delete names[name];
    }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGuestName: getGuestName
  };
}());

var users = {};

var people = {};
// export function for listening to the socket
module.exports = function (socket) {
  console.log('user connected');

  var name = userNames.getGuestName();
  users[name] = socket;
  // send the new user their name and a list of users
  // socket.emit('init', {
  //   name: name,
  //   users: userNames.get()
  // });

  socket.on('myusername', function(data) {
    console.log('data', data);
    people[data] = socket;
    var peopleArray = [];
    for(var key in people) {
      peopleArray.push(key);
    }
    socket.emit('init', {
      name: data,
      users: peopleArray
    })
    socket.broadcast.emit('bigInit', {
      users: peopleArray
    })
  })

  // join two users into a privateMessaging room
  socket.on('join:privateRoom', function(data) {
    for(var key in people) {
      if(key === data.users[0]) {
        console.log('joined myself to Room: ', data.roomName);
        people[key].join(data.roomName);
      }
      if(key === data.users[1]) {
        console.log('joined ' + data.users[1] + ' to ' + data.roomName);
        people[key].join(data.roomName);
      }
    }
  });

  socket.on('send:privateMessage', function(data) {
    console.log('data', data);
    console.log('socket', socket.rooms);
    socket.to(data.room).emit('send:message', {
      room: data.room,
      user: name,
      text: data.message
    });
  });

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    name: name
  });

  // broadcast a user's message to other people
  socket.on('send:message', function (data) {
    console.log('socket', socket.rooms);
    socket.broadcast.emit('send:message', {
      user: name,
      text: data.message
    });
  });

  // clean up when a user leaves, and broadcast it to other people
  socket.on('disconnect', function () {
    console.log('user disconnected');
    socket.broadcast.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });
};
