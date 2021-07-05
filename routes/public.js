const ejs = require('ejs');
const fs = require('fs');
const rooms = require('../models/roomModel');
const { service } = require('../config');
const host = require('../config').demo_host;
const { plain } = require('../config');

exports.index = function (req, res) {
  rooms.fetch({ id: service.id, key: service.key }, () => {
    const publicRooms = [];

    for (const r in rooms.roomList) {
      if (rooms.roomList[r].data.public) {
        const demo = rooms.roomList[r].data.type;
        let desc = '';
        try	{
          desc = fs.readFileSync(`public/demos/${demo}/${demo}.txt`);
        } catch (e) {
          desc = 'Demo room';
        }
        rooms.roomList[r].description = desc;
        publicRooms.push(rooms.roomList[r]);
      }
    }
    let title = 'Licode';
    if (plain) {
      title = 'Demo';
    }
    res.render('index', {
      title, rooms: publicRooms, host, plain,
    });
  }, () => {

  });
};

exports.room = function (req, res) {
  if (req.query.id) {
    rooms.get(req.query.id, { id: service.id, key: service.key }, (room) => {
      const demo = room.data.type;
      ejs.renderFile(`public/demos/${demo}/${demo}.html`, (err, body) => {
        if (err) {
          body = '';
        }
        let title = 'Licode';
        if (plain) {
          title = 'Demo';
        }
        res.render('demo', {
          demo, body, title, plain,
        });
      });
    }, () => {
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
};

exports.spy_room = function (req, res) {
  console.log(req.query.id);
  if (req.query.id) {
    rooms.get(req.query.id, { id: service.id, key: service.key }, (room) => {
      res.render('spy', { title: 'Licode', demo: 'spy' });
    }, () => {
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
};

exports.room_type = function (req, res) {
  if (req.query.id) {
    rooms.get(req.query.id, { id: service.id, key: service.key }, (room) => {
      res.send(room.data.type);
    }, () => {
      res.send(404);
    });
  } else {
    res.send(404);
  }
};
