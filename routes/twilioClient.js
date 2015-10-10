var config = require('config')
  , twilio = require('twilio')
  , client = require('twilio')(config.twilio.SID, config.twilio.Token)
  , socket = require('socket.io-client')(config.hostname)
  , twi = require('../routes/twi')
  , ai = require('../routes/ai')
;

module.exports = twilioClient;

function twilioClient() {
  console.log('twilioClient loaded.');

  var _callSid = null;  // 相手先との通話SID

  // 接続
  socket.on('connect', function(){
    console.log('twilioClient connected.');
    socket.emit('TwilioToCenter', {
      type : 'login',
      values : {
        twilioSocketId: socket.id
      }
    });
  });

  // 切断
  socket.on('disconnect', function(){
  });

  // センターからのメッセージを受信
  socket.on('CenterToTwilio', function(data){
    console.log('CenterToTwilio (type:'+data.type+')');

    // 応答メッセージを作成して、指定された番号に発信する
    if (data.type === 'dial') {
      console.log('twilioClient.js/CenterToTwilio(dial) called.('+data.values.callTo+', '+data.values.speaker_id+')');

      // 応答メッセージの作成
      var message = 'エーアイトークを使って、音声文字変換テストを行います。しばらくこのままでお待ち下さい。';
      ai.text2wav(message, data.values.speaker_id, function(err) {
        if (err) {
          console.error(err.message);
        } else {
          // ダイヤル発信
          twi.dial(data.values.callTo, function(err, callSid) {
            if (err) {
              console.error(err.message);
            } else {
              _callSid = callSid;
              console.log(data.values.callTo+'に発信を行いました。');
            }
          });
        }
      });
    }

    // 通話中の回線を切断する
    if (data.type === 'cancel') {
      console.log('twilioClient.js/CenterToTwilio(cancel) called.');

      twi.cancel(_callSid, function(err) {
        if (err) {
          console.error(err);
        } else {
          console.log('通話を切断しました。');
        }
      });
    }

    // メッセージを再生する
    if (data.type === 'data') {
      console.log('twilioClient.js/CenterToTwilio(data) called.');

      // 応答メッセージの作成
      var message = data.values.message;
      ai.text2wav(message, data.values.speaker_id, function(err) {
        if (err) {
          console.error(err.message);
        } else {
          // メッセージ送信
          twi.update(_callSid, function(err) {
            if (err) {
              console.error(err.message);
            } else {
              console.log('メッセージを送信しました。');
            }
          });
        }
      });
    }
  });

}
