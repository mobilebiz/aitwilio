/**
 * Twilio関連
 */
var config = require('config')
  , twilio = require('twilio')
  , client = require('twilio')(config.twilio.SID, config.twilio.Token)
  , socket = require('socket.io-client')(config.hostname)
;

/**
 * 相手先に発信
 * @param callTo 電話番号
 * @return err エラーオブジェクト
 * @return callSid 発信時に割り当てられたCallSid
 **/
exports.dial = function(callTo, callback) {
  console.log('twi.dial called('+callTo+')');

  var tel = callTo;
  tel =  (tel.substring(0, 1) === '+' ? tel : '+81' + tel.substring(1));   // 0AB〜Jを+81に変換
  client.calls.create({
    url: 'https://'+config.twilio.Server+'/guidance',
    to: tel,
    from: config.twilio.From,
    timeout: 60,
    statusCallback: 'https://'+config.twilio.Server+'/statusCallback',
    statusCallbackMethod: "POST",
    statusCallbackEvent: ["ringing", "answered", "completed"]
  }, function(err, call) {
    if (err) {
      callback(err);
    } else {
      callback(null, call.sid);  // twilioが割り当てたCallSidを返す
    }
  });
};

/**
 * 通話をキャンセルする
 * @param  callSid キャンセルしたいCallSid
 * @return err エラーオブジェクト
 */
exports.cancel = function(callSid, callback) {
  console.log('twi.cancel called('+callSid+')');

  client.calls(callSid).update({
    status: 'completed'
  }, function(err, call) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};

/**
 * 音声を再生する
 * @param  callSid 再生させたいCallSid
 * @return err エラーオブジェクト
 */
exports.update = function(callSid, callback) {
  console.log('twi.update called('+callSid+')');

  client.calls(callSid).update({
    url: "https://"+config.twilio.Server+"/guidance",
    statusCallback: "http://"+config.twilio.Server+"/statusCallback"
  }, function(err, call) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};

/**
 * 音声ガイダンスを返すTwiMLを生成
 * guidance.wavはユーザが作成した音声ファイル ※１度だけ再生
 * no_sound.wavは無音ファイル(1秒)　※無限ループ再生
 * @param  なし
 * @return err  エラーオブジェクト
 */
exports.guidance = function(callback) {
  console.log('twi.guidance called.');

  var resp = new twilio.TwimlResponse();
  resp.play('https://' + config.twilio.Server + '/messages/guidance.wav', { loop: 1 })
  .play('https://' + config.twilio.Server + '/messages/no_sound.wav', { loop: 0 });
  callback(null, resp.toString());
}

/**
 * ステータスに変化があった場合にTwilio側から呼ばれ、ステータスに応じてTwilioToCenterのメッセージを返却する
 * @param  reqBody     twilio側がセットしてきたパラメータ群
 * @return             なし
 */
exports.statusCallback = function(reqBody, callback) {
  console.log('twi.statusCallback called.');

  // センターに通知
  socket.emit('TwilioToCenter', {
    type : reqBody.CallStatus,
    values: {
    }
  });
  callback(null);
};
