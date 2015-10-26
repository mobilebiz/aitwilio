var config = require('config')
  , fs = require('fs')
;

/**
 * テキストデータを音声変換して、guidance.wavファイルに書き込む
 * @param message: 変換用テキスト
 * @param speaker_id: 話者コード
 * @return callback(err)
 */
exports.text2wav = function(message, speaker_id, callback) {
  console.log("text2wav called.");

  // APIコール
  var http = require('http');
  var querystring = require('querystring');
  var options = {
    host: 'webapi.aitalk.jp',
    path: '/webapi/v1/ttsget.php',
    port: 80,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  var data = querystring.stringify({
    'username': config.ai.username
  , 'password': config.ai.password
  , 'text': message
  , 'ext': 'wav'
  , 'speaker_id': speaker_id
  , 'volume': 1.5
  , 'speed': 1.0
  , 'pitch': 1.0
  , 'range': 1.0
  });
  var req = http.request(options, function(res) {
    console.log("AITalk Web API statusCode: " + res.statusCode);

    if (res.statusCode != 200) {
      console.error('AITalk Web API connect error(' + res.statusCode + ')');
      callback(new Error('AITalk Web API connect error(' + res.statusCode + ')'));
      return;
    }

    var buf = '';
    res.setEncoding('binary');
    res.on('data', function(chunk) {
      buf += chunk;
    });
    res.on('end', function() {
      console.log("Download completed!(" + buf.length + ")");
      fs.writeFile('./public/messages/guidance.wav', buf, 'binary', function(err) {
        if (err) {
          console.error(err.message);
          callback(new Error('WAV file output error.'));
        } else {
          console.log('guidance.wav created.');
          callback(null);
        }
      });
    });
  }).on('error', function(err) {
    console.error(err.message);
    callback(err);
  });
  req.write(data);
  req.end();

};
