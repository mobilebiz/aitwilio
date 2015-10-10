var ai = require('../routes/ai');

describe('AITalk Web APIのテスト', function() {
  // 前準備
  before(function (done) {
    done();
  });

  // 後処理
  after(function (done) {
    done();
  });

  describe('text2wavのテスト', function() {
    it ('音声ファイルを生成してみる', function (done) {
      var message = 'これはテストです。';
      var speaker_id = 1; // のぞみ
      ai.text2wav(message, speaker_id, function(err) {
        done();
      });
    });
  });

});
