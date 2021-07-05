let localStream; let room; let
  teacher_stream;

DEMO.init_demo = function (my_name) {
  const screen = true;
  teacher_stream = Erizo.Stream({
    audio: true, video: true, data: true, screen: false, attributes: { name: my_name },
  });
  localStream = Erizo.Stream({
    audio: true, video: false, data: true, screen: false, attributes: { name: my_name },
  });
  DEMO.chat_stream = localStream;

  DEMO.create_token(my_name, 'presenter', (response) => {
    const token = response;
    console.log(token);
    room = Erizo.Room({ token });

    teacher_stream.addEventListener('access-accepted', () => {
      room.publish(teacher_stream);
      screen_publishing = true;
      const b = document.getElementById('share_button');
      b.className += ' intermittent';
      document.getElementById('share_message').innerHTML = 'Now you are the teacher.';
      b.innerHTML = 'Stop being the teacher';
      localStream.hide();
      teacher_stream.show('localVideo');
    });

    localStream.addEventListener('access-accepted', () => {
      const subscribeToStreams = function (streams) {
        for (const index in streams) {
          const stream = streams[index];
          if (localStream.getID() !== stream.getID() && teacher_stream.getID() !== stream.getID()) {
            room.subscribe(stream);
          }
        }
      };

      room.addEventListener('room-connected', (roomEvent) => {
        DEMO.connect_to_chat();
        room.publish(localStream);
        subscribeToStreams(roomEvent.streams);
      });

      room.addEventListener('stream-subscribed', (streamEvent) => {
        const { stream } = streamEvent;

        if (stream.hasVideo()) {
          hide_share_panel();
          stream.show('screen');
        } else {
          add_div_to_grid(`test${stream.getID()}`, stream.getAttributes().name);
          stream.show(`test${stream.getID()}`);
        }

        stream.addEventListener('stream-data', DEMO.chat_message_received);
      });

      room.addEventListener('stream-added', (streamEvent) => {
        const streams = [];
        streams.push(streamEvent.stream);
        subscribeToStreams(streams);
      });

      room.addEventListener('stream-removed', (streamEvent) => {
        // Remove stream from DOM
        const { stream } = streamEvent;
        if (stream.elementID !== undefined) {
          if (stream.hasVideo()) {
            document.getElementById('screen').innerHTML = '';
            show_share_panel();
          } else {
            remove_div_from_grid(stream.elementID);
          }
        }
      });

      room.connect();

      create_grid();

      add_div_to_grid('localVideo', `${my_name} (me)`);
      localStream.show('localVideo');
    });
    localStream.init();
  });
};

var screen_publishing = false;

var show_share_panel = function () {
  const share_panel = document.createElement('div');
  share_panel.setAttribute('id', 'share_panel');
  const p = document.createElement('h2');
  p.setAttribute('id', 'share_message');
  p.innerHTML = 'There is no theacher in this classroom. Click the button to become a teacher.';
  p.className = 'lead';

  const b = document.createElement('button');
  b.setAttribute('id', 'share_button');
  b.className = 'btn btn-large btn-primary';
  b.innerHTML = 'Be the teacher';

  b.onclick = function () {
    if (screen_publishing) {
      teacher_stream.close();
      screen_publishing = false;
      b.className = b.className.replace(/\bintermittent\b/, '');
      p.innerHTML = 'There is no theacher in this classroom. Click the button to become a teacher.';
      b.innerHTML = 'Be the teacher';
      room.publish(localStream);
      DEMO.chat_stream = localStream;
      localStream.show('localVideo');
    } else {
      room.unpublish(localStream);
      teacher_stream.init();
      DEMO.chat_stream = teacher_stream;
    }
  };

  share_panel.appendChild(p);
  share_panel.appendChild(b);
  share_panel.setAttribute('style', 'margin-top: 20%');
  document.getElementById('screen').appendChild(share_panel);

  if (document.getElementById('full_screen_button')) {
    document.getElementById('screen').removeChild(document.getElementById('full_screen_button'));
  }
};

var hide_share_panel = function () {
  const b = document.createElement('img');
  b.setAttribute('id', 'full_screen_button');
  b.src = '../../images/full_screen.png';
  b.setAttribute('style', 'right: 0px; position: absolute; z-index: 1; width: 35px; cursor: pointer;');

  const full_screen = false;

  b.onclick = function () {
    const elem = document.getElementById('video_grid');

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else {
      return;
    }

    $('#video_grid').css('width', '99%');
    $('#video_grid').css('height', '100%');
    $('#full_screen_button').css('display', 'none');

    $('#conference_video_grid').css('display', 'none');
    $('#screen').css('height', '100%');
    $('#screen div video').css('height', '80%');
    $('#screen div video').css('width', '80%');
    $('#screen div video').css('left', '10%');
    $('#screen div video').css('top', '10%');
  };

  const fullScreenChanged = function () {
    const fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;

    if (!fullscreenElement || fullscreenElement === undefined) {
      $('#video_grid').css('width', '');
      $('#video_grid').css('height', '');
      $('#full_screen_button').css('display', '');

      $('#conference_video_grid').css('display', '');
      $('#screen').css('height', '80%');
    }
  };

  $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', fullScreenChanged);

  document.getElementById('screen').appendChild(b);

  document.getElementById('screen').removeChild(document.getElementById('share_panel'));
};

var create_grid = function () {
  const grid = document.getElementById('video_grid');
  const newDiv = document.createElement('div');
  newDiv.className += ' grid_element_border';
  newDiv.setAttribute('id', 'screen');

  const newDiv3 = document.createElement('div');
  newDiv3.setAttribute('id', 'conference_video_grid');

  grid.appendChild(newDiv);
  grid.appendChild(newDiv3);

  $('#screen').css('text-align', 'center');
  $('#conference_video_grid').css('height', '20%');
  $('#screen').css('height', '80%');
  $('#screen').css('width', '100%');
  $('#screen').css('background-color', 'white');

  show_share_panel();
};

var add_div_to_grid = function (divId, name) {
  // $('#video_grid').css('border', 'none');

  const grid = document.getElementById('conference_video_grid');
  const newDiv = document.createElement('div');
  newDiv.setAttribute('id', `${divId}_container`);
  newDiv.className += ' grid_element_border';

  const newDiv2 = document.createElement('div');
  newDiv2.setAttribute('id', divId);
  newDiv2.className += ' grid_element';
  newDiv.appendChild(newDiv2);

  newDiv2.setAttribute('style', 'background-image: url(../../images/audio_user.png); background-position: center; background-repeat: no-repeat; background-color: white; background-size: contain;');

  const p = document.createElement('h5');
  p.innerHTML = name;
  p.setAttribute('style', 'position: absolute; padding-left: 10px');
  newDiv.appendChild(p);

  grid.appendChild(newDiv);
  resizeGrid('video_grid');
};

var remove_div_from_grid = function (divId) {
  const grid = document.getElementById('conference_video_grid');
  grid.removeChild(document.getElementById(`${divId}_container`));
  resizeGrid();
};

var resizeGrid = function () {
  const grid = document.getElementById('conference_video_grid');
  const nChilds = grid.childElementCount;

  if (nChilds < 6) {
    const w = `${20 * nChilds}%`;
    const m = `${(100 - (nChilds * 20)) / 2}%`;

    $('#conference_video_grid').css('width', w);
    $('#conference_video_grid').css('margin-left', m);

    for (var i = 0; i < nChilds; i++) {
      grid.childNodes[i].setAttribute('style', `width: ${100 / nChilds}%; height: 100%;`);
    }
  } else {
    $('#conference_video_grid').css('width', '100%');
    $('#conference_video_grid').css('margin-left', '0');

    for (var i = 0; i < nChilds; i++) {
      grid.childNodes[i].setAttribute('style', `width: ${100 / nChilds}%; height: 100%;`);
    }
  }
};
