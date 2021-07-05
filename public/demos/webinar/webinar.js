let localStream; let room; let screen_stream; let
  teacher;

DEMO.init_demo = function (my_name) {
  teacher = getParameterByName('mode') === 'presenter';

  if (teacher) {
    screen_stream = Erizo.Stream({ screen: true });
    localStream = Erizo.Stream({
      audio: true, video: true, data: true, screen: false, attributes: { name: my_name },
    });

    DEMO.chat_stream = localStream;

    DEMO.create_token('user', 'presenter', (response) => {
      const token = response;
      console.log(token);
      room = Erizo.Room({ token });

      screen_stream.addEventListener('access-accepted', () => {
        room.publish(screen_stream);
        screen_stream.show('screen');
      });

      localStream.addEventListener('access-accepted', () => {
        const subscribeToStreams = function (streams) {
          for (const index in streams) {
            const stream = streams[index];
            if (localStream.getID() !== stream.getID() && screen_stream.getID() !== stream.getID()) {
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
          stream.addEventListener('stream-data', DEMO.chat_message_received);
          DEMO.add_chat_participant(stream.getAttributes().name, stream.getID());
        });

        room.addEventListener('stream-added', (streamEvent) => {
          const streams = [];
          streams.push(streamEvent.stream);
          subscribeToStreams(streams);
        });

        room.addEventListener('stream-removed', (streamEvent) => {
          // Remove stream from DOM
          const { stream } = streamEvent;
          if (stream.hasScreen()) {
            document.getElementById('screen').innerHTML = '';
            show_share_panel();
          } else {
            if (stream.elementID !== undefined) remove_div_from_grid(stream.elementID);
            DEMO.remove_chat_participant(stream.getAttributes().name, stream.getID());
          }
        });

        room.connect();

        create_grid();

        add_div_to_grid('localVideo');
        localStream.show('localVideo');
      });
      localStream.init();
      screen_stream.init();
    });
  } else {
    localStream = Erizo.Stream({
      audio: false, video: false, data: true, screen: false, attributes: { name: my_name },
    });

    DEMO.chat_stream = localStream;

    DEMO.create_token('user', 'viewerWithData', (response) => {
      const token = response;
      console.log(token);
      room = Erizo.Room({ token });

      localStream.addEventListener('access-accepted', () => {
        const subscribeToStreams = function (streams) {
          for (const index in streams) {
            const stream = streams[index];
            if (localStream.getID() !== stream.getID()) {
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

          if (stream.hasScreen()) {
            show_full_panel();
            stream.show('screen');
          } else if (stream.hasVideo()) {
            add_div_to_grid(`test${stream.getID()}`);
            stream.show(`test${stream.getID()}`);
          }

          if (stream.hasData()) {
            stream.addEventListener('stream-data', DEMO.chat_message_received);
            DEMO.add_chat_participant(stream.getAttributes().name, stream.getID());
          }
        });

        room.addEventListener('stream-added', (streamEvent) => {
          const streams = [];
          streams.push(streamEvent.stream);
          subscribeToStreams(streams);
        });

        room.addEventListener('stream-removed', (streamEvent) => {
          // Remove stream from DOM
          const { stream } = streamEvent;
          if (stream.hasScreen()) {
            document.getElementById('screen').innerHTML = '';
          } else {
            DEMO.remove_chat_participant(stream.getAttributes().name, stream.getID());
            if (stream.elementID !== undefined) remove_div_from_grid(stream.elementID);
          }
        });

        room.connect();
        create_grid();
      });
      localStream.init();
    });
  }
};

var show_full_panel = function () {
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
  };

  const fullScreenChanged = function () {
    const fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;

    if (fullscreenElement === null) {
      $('#video_grid').css('width', '');
      $('#video_grid').css('height', '');
      $('#full_screen_button').css('display', '');

      $('#conference_video_grid').css('display', '');
      $('#screen').css('height', '80%');
    }
  };

  $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', fullScreenChanged);

  document.getElementById('screen').appendChild(b);
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
};

var add_div_to_grid = function (divId) {
  // $('#video_grid').css('border', 'none');

  const grid = document.getElementById('conference_video_grid');
  const newDiv = document.createElement('div');
  newDiv.setAttribute('id', `${divId}_container`);
  newDiv.className = `${newDiv.className} grid_element_border`;

  const newDiv2 = document.createElement('div');
  newDiv2.setAttribute('id', divId);
  newDiv2.className = `${newDiv2.className} grid_element`;
  newDiv.appendChild(newDiv2);

  grid.appendChild(newDiv);
  resizeGrid();
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

var getParameterByName = function (name) {
  name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
  const regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
  const results = regex.exec(location.search);
  return results == null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
