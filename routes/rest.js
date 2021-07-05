const rooms = require('../models/roomModel');
const tokens = require('../models/tokenModel');
const { service } = require('../config');

exports.createToken = function (req, res) {
  const { roomId } = req.body;
  const { username } = req.body;
  const { role } = req.body;
  tokens.create(roomId, username, role, { id: service.id, key: service.key }, (token) => {
    console.log('eieieiie', token);
    res.send(token);
  }, (e) => {
    console.log('nonon ', e);
    res.send(e);
  });
};

exports.createRoom = function (req, res) {
  let p2p = false;
  if (req.body.p2p) {
    p2p = true;
  }
  const data = { type: req.body.type };
  if (req.body.public) {
    data.public = true;
  } else {
    data.public = false;
  }
  rooms.create(req.body.name, data, p2p, { id: req.session.id, key: req.session.key }, () => {
    console.log('deleted');
    res.redirect('/admin');
  }, () => {
    req.session = null;
    res.redirect('/admin/login');
  });
};

exports.deleteRoom = function (req, res) {
  rooms.delete(req.params.room, { id: req.session.id, key: req.session.key }, () => {
    console.log('deleted');
    res.redirect('/admin');
  }, () => {
    req.session = null;
    res.redirect('/admin/login');
  });
};
