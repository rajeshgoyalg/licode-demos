const N = require('./nuve');
const nuveHost = require('../config').nuve_host;

exports.roomList = {};

exports.fetch = function (auth, callback, error) {
  N.API.init(auth.id, auth.key, nuveHost);
  N.API.getRooms((rooms) => {
    exports.roomList = JSON.parse(rooms);
    callback();
  }, () => {
    error();
  });
};

exports.get = function (roomId, auth, callback, error) {
  N.API.init(auth.id, auth.key, nuveHost);
  N.API.getRoom(roomId, (room) => {
    callback(JSON.parse(room));
  }, () => {
    error();
  });
};

exports.create = function (roomName, data, p2p, auth, callback, error) {
  N.API.init(auth.id, auth.key, nuveHost);
  N.API.createRoom(roomName, (rooms) => {
    callback();
  }, () => {
    error();
  }, { data, p2p });
};

exports.delete = function (roomId, auth, callback, error) {
  N.API.init(auth.id, auth.key, nuveHost);

  N.API.deleteRoom(roomId, (rooms) => {
    callback();
  }, () => {
    error();
  });
};
