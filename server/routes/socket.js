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
// export function for listening to the socket
module.exports = function (socket) {
  console.log('user connected');

  var name = userNames.getGuestName();
  users[name] = socket;
  // send the new user their name and a list of users
  socket.emit('init', {
    name: name,
    users: userNames.get()
  });


  socket.on('join', function (data) {
    // console.log('USERS', users);
    for(var key in users) {
      users[key].join(data.room);
    }
  });

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    name: name
  });
  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
    console.log('socket', socket.rooms);
    socket.broadcast.emit('send:message', {
      user: name,
      text: data.message
    });
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    console.log('user disconnected');
    socket.broadcast.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });
};
