var socketio = require('socket.io')
  , config = require('config')
  , twilioClient = require('../routes/twilioClient')
  , ai = require('../routes/ai')
  , my = require('../routes/sio')
;

module.exports = sio;

/**
 * センターコントロール側のSocket.ioモジュール
 *
 * @param  {Express Server} server Express Server
 */
function sio(server) {

  var _twilioClientSocketId = '';  // Twilio clientのSocketId

  // Socket.IO
  var io = socketio(server);
  console.log('socket.IO initialized.');

  // Twilio client load
  twilioClient();

  // 接続
  io.on('connection', function(socket) {
    /*********************
      UserToCenter
    **********************/
    socket.on('UserToCenter', function(data) {
      console.log('UserToCenter(type:'+data.type+')');

      // 発信ボタンを押した
      if (data.type === 'dial') {
        console.log('dial called.('+data.values.callTo+', '+data.values.speaker_id+')');

        // twilioClientにメッセージを通知
        io.emit('CenterToTwilio', {
          type : 'dial',
          values : {
            callTo: data.values.callTo,
            speaker_id: data.values.speaker_id
          }
        });
      }

      // 切断ボタンを押した
      if (data.type === 'cancel') {
        console.log('cancel called.');

        // twilioClientにメッセージを通知
        io.emit('CenterToTwilio', {
          type : 'cancel',
          values : {
          }
        });

      }

      // メッセージが入力された
      if (data.type === 'data') {
        console.log('data called.('+data.values.message+', '+data.values.speaker_id+')');

        // TwilioClientにメッセージを通知
        io.emit('CenterToTwilio', {
          type : 'data',
          values : {
            message: data.values.message,
            speaker_id: data.values.speaker_id
          }
        });

      }

    });

    /***************************
      TwilioToCenter
    ****************************/
    socket.on('TwilioToCenter', function(data) {
      console.log('TwilioToCenter(type:'+data.type+')');

      // 準備完了
      if (data.type === 'login') {
        console.log('login called.('+data.values.twilioSocketId+')');

        // TwilioClientのSocket IDを保存
        _twilioClientSocketId = data.values.twilioSocketId;
        console.log('TwilioClientが起動しました。('+data.values.twilioSocketId+')');
      }

      // ステータス取得（呼出中）
      if (data.type === 'ringing') {
        // ユーザにメッセージを通知
        io.emit('CenterToUser', {
          type : 'info',
          values : {
            message: '相手先を呼出中です...'
          }
        });
      }

      // ステータス取得（相手先応答）
      if (data.type === 'in-progress') {
        // ユーザにメッセージを通知
        io.emit('CenterToUser', {
          type : 'info',
          values : {
            message: '相手先が応答しました。'
          }
        });
        io.emit('CenterToUser', {
          type : 'connect',
          values : {
          }
        });
      }

    });

    // 切断
    socket.on("disconnect", function() {
    });
  });
}
