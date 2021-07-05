let localStream; let
  room;

DEMO.init_demo = function (my_name) {
  const screen = getParameterByName('screen');
  localStream = Erizo.Stream({
    audio: true, video: true, data: true, screen, attributes: { name: my_name },
  });
  DEMO.chat_stream = localStream;

  DEMO.create_token(my_name, 'presenter', (response) => {
    const token = response;
    console.log(token);
    room = Erizo.Room({ token });

    $(window).resize(() => {
      DEMO.resizeVideos(localStream, room.remoteStreams);
    });

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
        console.log('vopy a pub');
        room.publish(localStream);
        subscribeToStreams(roomEvent.streams);
      });

      room.addEventListener('stream-subscribed', (streamEvent) => {
        const { stream } = streamEvent;

        add_div_to_grid(`test${stream.getID()}`);
        stream.show(`test${stream.getID()}`);
        DEMO.resizeVideos(localStream, room.remoteStreams);

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
        if (stream.elementID !== undefined) {
          DEMO.remove_chat_participant(stream.getAttributes().name, stream.getID());
          remove_div_from_grid(stream.elementID, 'video_grid');
          DEMO.resizeVideos(localStream, room.remoteStreams);
        }
      });

      room.connect();

      add_div_to_grid('localVideo');
      localStream.show('localVideo');
      DEMO.resizeVideos(localStream, room.remoteStreams);
    });
    localStream.init();
  });
};

var add_div_to_grid = function (divId) {
  $('#video_grid').css('border', 'none');

  const grid = document.getElementById('video_grid');
  const newDiv = document.createElement('div');
  newDiv.setAttribute('id', `${divId}_container`);
  newDiv.className = `${newDiv.className} grid_element_border`;

  const newDiv2 = document.createElement('div');
  newDiv2.setAttribute('id', divId);
  newDiv2.className = `${newDiv2.className} grid_element`;
  newDiv.appendChild(newDiv2);

  grid.appendChild(newDiv);
  resizeGrid('video_grid');
};

var remove_div_from_grid = function (divId) {
  const grid = document.getElementById('video_grid');
  grid.removeChild(document.getElementById(`${divId}_container`));
  resizeGrid('video_grid');
};

var resizeGrid = function () {
  const grid = document.getElementById('video_grid');
  const nChilds = grid.childElementCount;

  const c = Math.floor((nChilds - 1) / 3);
  const r = (nChilds - 1) % 3;

  if (nChilds === 1) {
    grid.childNodes[1].setAttribute('style', 'width: 100%; height: 100%;');
  } else {
    const height = 100 / (c + 1);

    for (let i = 1; i <= nChilds; i++) {
      const row = Math.floor((i - 1) / 3);
      let width = 100 / 3;

      if (r === 0) { // las dos últimas filas tienen dos vídeos
        if (row > c - 2) {
          width = 50;
        }
        grid.childNodes[i].setAttribute('style', `width: ${width}%; height: ${height}%;`);
      } else if (r === 1) { // la última fila tiene un vídeo
        if (row === c) {
          width = 50;
        }
        grid.childNodes[i].setAttribute('style', `width: ${width}%; height: ${height}%;`);
      } else {
        grid.childNodes[i].setAttribute('style', `width: ${width}%; height: ${height}%;`);
      }
    }
  }
};
