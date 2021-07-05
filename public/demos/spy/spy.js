let localStream; let
  room;

DEMO.init_demo = function (my_name) {
  const screen = getParameterByName('screen');
  L_SESSION.displayed = {};
  // we have not localstream but it will be used in several checks
  L_SESSION.localStream = {};

  L_SESSION.screens_always_in_mini = true;

  L_SESSION.localStream.getID = function () { return 'undefined'; };

  DEMO.create_token(my_name, 'presenter', (response) => {
    const token = response;
    console.log(token);
    room = Erizo.Room({ token });

    $(window).resize(() => {
      L_SESSION.resizeGrid();
    });

    const subscribeToStreams = function (streams) {
      for (const index in streams) {
        const stream = streams[index];
        room.subscribe(stream);
      }
    };

    room.addEventListener('room-connected', (roomEvent) => {
      subscribeToStreams(roomEvent.streams);
    });

    room.addEventListener('stream-subscribed', (streamEvent) => {
      const { stream } = streamEvent;

      if (stream.hasScreen()) {
        L_SESSION.add_div_to_grid(`video${stream.getID()}`, 'mini');
        stream.play(`video${stream.getID()}`);
        L_SESSION.displayed[stream.getID()] = stream;
        L_SESSION.rewriteBar(stream.getID(), undefined, undefined, undefined, true);
      } else {
        L_SESSION.add_div_to_grid(`video${stream.getID()}`, 'main');
        stream.play(`video${stream.getID()}`);
        L_SESSION.displayed[stream.getID()] = stream;
        L_SESSION.rewriteBar(stream.getID(), stream.getAttributes().name, undefined, undefined, true);
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
      if (stream.elementID !== undefined) {
        L_SESSION.remove_div_from_grid(stream.elementID);
      }
      L_SESSION.remove_participant(stream.getID());
      delete L_SESSION.displayed[stream.elementID];
    });

    room.connect();
  });
};
