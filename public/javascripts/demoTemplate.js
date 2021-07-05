const serverUrl = '/';

const DEMO = {};

function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
  const regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
  const results = regex.exec(location.search);
  return results == null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

DEMO.create_token = function (userName, role, callback) {
  const req = new XMLHttpRequest();
  const url = `${serverUrl}token`;
  const body = { roomId: getParameterByName('id'), username: userName, role };

  req.onreadystatechange = function () {
    if (req.readyState === 4) {
      callback(req.responseText);
    }
  };

  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.send(JSON.stringify(body));
};

DEMO.resizeVideos = function (local, remotes) {
  local.player.resize();
  for (const r in remotes) {
    if ((remotes[r].hasVideo() || remotes[r].hasScreen()) && remotes[r].showing) {
      remotes[r].player.resize();
    }
  }
};

window.onload = function () {
  $('#connection_panel').modal({ keyboard: false, backdrop: 'static' });

  const messText = document.getElementById('chat_message');
  const chat_body = document.getElementById('chat_body');
  const users_list = document.getElementById('users_list');

  let my_name;

  DEMO.close = function () {
    window.location.href = '/';
  };

  for (const i in document.getElementsByClassName('close_button')) {
    document.getElementsByClassName('close_button')[i].onclick = DEMO.close;
  }

  // document.getElementById('back_icon').onclick = DEMO.close;

  messText.onkeyup = function (e) {
    e = e || event;
    if (e.keyCode === 13) {
      DEMO.send_chat_message();
    }
    return true;
  };

  const add_text_to_chat = function (text, style) {
    const p = document.createElement('p');
    p.className = `chat_${style}`;
    p.innerHTML = text;
    chat_body.appendChild(p);
    chat_body.scrollTop = chat_body.scrollHeight;
  };

  const add_user_to_list = function (name, id) {
    const p = document.createElement('p');
    // p.className = 'chat_' + style;
    p.innerHTML = `<i class="icon-user"></i> ${name}`;
    p.id = id;
    console.log('add ', name);
    users_list.appendChild(p);
  };

  const remove_user_from_list = function (id) {
    const p = document.getElementById(id);
    p.parentElement.removeChild(p);
  };

  DEMO.connect_to_chat = function () {
    add_text_to_chat('Succesfully connected to the room', 'italic');
  };

  DEMO.add_chat_participant = function (name, id) {
    add_text_to_chat(`New participant: ${name}`, 'italic');
    add_user_to_list(name, id);
  };

  DEMO.remove_chat_participant = function (name, id) {
    add_text_to_chat(`Participant ${name} left the room`, 'italic');
    remove_user_from_list(id);
  };

  DEMO.send_chat_message = function () {
    if (messText.value.match(/\S/)) {
      if (DEMO.chat_stream) {
        DEMO.chat_stream.sendData({ msg: messText.value, name: my_name });
      }
      add_text_to_chat(`${my_name}: `, 'name');
      add_text_to_chat(messText.value, '');
    }
    messText.value = '';
  };

  DEMO.chat_message_received = function (evt) {
    const { msg } = evt;
    add_text_to_chat(`${msg.name}: `, 'name');
    add_text_to_chat(msg.msg, '');
  };

  const connect_user = function (e) {
    my_name = document.getElementById('username_txt').value;
    $('#connection_panel').modal('hide');
    DEMO.init_demo(my_name);
  };

  document.getElementById('username_txt').onkeyup = function (e) {
    e = e || event;
    if (e.keyCode === 13) {
      connect_user();
    }
    return true;
  };

  document.getElementById('connect_form').onsubmit = function (event) {
    event.preventDefault();
    connect_user();
  };

  document.getElementById('chat_button').onclick = function () {
    $('#users_button').removeClass('active');
    $('#chat_button').addClass('active');
    $('#chat_body').show();
    $('#chat_message').show();
    $('#users_list_container').hide();
  };

  document.getElementById('users_button').onclick = function () {
    $('#users_button').addClass('active');
    $('#chat_button').removeClass('active');
    $('#chat_body').hide();
    $('#chat_message').hide();
    $('#users_list_container').show();
  };
};
