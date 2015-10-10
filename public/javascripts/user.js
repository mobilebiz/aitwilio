// socket.io接続
var socket = io.connect();

// 接続時
socket.on('connect', function() {});

// 切断時
socket.on('disconnect', function(client) {});

// センターからの受信
socket.on('CenterToUser', function(data) {
  if (data.type === 'info') {
    // メッセージを表示
    $("#message").html(data.values.message);
  }

  if (data.type === 'connect') {
    // メインページに移動
    myNavigator.pushPage('mainPage', { animation : 'slide' } );
    $("#main_history_content").append('<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>');
    $("#main_transparent_input").focus();
  }

});

// 発信ボタンを押した
function btn_connect_click() {
  socket.emit('UserToCenter', {
    type : 'dial',
    values : {
      callTo: $("#callTo").val(),
      speaker_id: $("#speaker_id").val()
    },
  });
}

// 切断ボタンを押した
function btn_cancel_click() {
  cancel();
  // 発信ページに移動
  myNavigator.popPage();
}

// 切断メッセージの送信
function cancel() {
  socket.emit('UserToCenter', {
    type : 'cancel',
    values : {
    },
  });
}

// テキストの送信
function main_transparent_input_crlf() {
  $("#main_history_content").append($("#main_transparent_input").val()+"<br>");
  if ($("#main_transparent_input").val()) {
    socket.emit('UserToCenter', {
      type : 'data',
      values : {
        message: $("#main_transparent_input").val(),
        speaker_id: $("#speaker_id").val()
      },
    });
  }
  $("#main_history_content").scrollTop(1000000);  // 常に一番下にスクロールする
  $("#main_transparent_input").val("");
}

ons.bootstrap();
ons.ready(function() {
});
