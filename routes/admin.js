const rooms = require('../models/roomModel');
const host = require('../config').demo_host;

let state = '';

exports.auth = function (req, res, next) {
  if (req.session.id) {
    if ((new Date()).getTime() < req.session.expires) {
      next();
    } else {
      state = 3;
      req.session = null;
      res.redirect('/admin/login');
    }
  } else {
    res.redirect('/admin/login');
  }
};

exports.admin = function (req, res) {
  rooms.fetch({ id: req.session.id, key: req.session.key }, () => {
    console.log(' rooms: ', rooms.roomList);
    res.render('management', { rooms: rooms.roomList, title: 'Admin Panel', host });
  }, () => {
    req.session = null;
    state = 2;
    res.redirect('/admin/login');
  });
};

exports.login = function (req, res) {
  if (req.body.id) {
    req.session.id = req.body.id;
    req.session.key = req.body.key;
    req.session.expires = (new Date()).getTime() + 120 * 60 * 1000;
    res.redirect('/admin');
  } else {
    let msg = '';
    if (state === 1) {
      msg = 'Logged out';
      state = 0;
    } else if (state === 2) {
      msg = 'Wrong credentials';
      state = 0;
    } else if (state === 3) {
      msg = 'Session expired';
      state = 0;
    }
    res.render('login', { title: 'Admin Panel', msg });
  }
};

exports.logout = function (req, res) {
  state = 1;
  req.session = null;
  res.redirect('/admin');
};
